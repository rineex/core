import type { Observable } from 'rxjs';
import type { DatabasePool } from 'slonik';

import { Logger } from '@nestjs/common';
import { format } from 'node:util';
import { defer, delay, lastValueFrom, of, retry, throwError } from 'rxjs';
import { createPool } from 'slonik';

import type { SlonikConnectionConfig } from './slonik.interface';

import { DEFAULT_POOL_NAME, SLONIK_POOL_TOKEN } from './constants';

export const createSlonikToken = (name: string = DEFAULT_POOL_NAME) =>
  format(SLONIK_POOL_TOKEN, name.toUpperCase());

const logger = new Logger('SlonikModule');

export function createSlonikConnection({
  dsn,
  name,
  options,
}: SlonikConnectionConfig): Promise<DatabasePool> {
  const token = createSlonikToken(name);

  return lastValueFrom(
    defer(async () => {
      const pool = await createPool(dsn, options);

      await pool
        .connect(() => Promise.resolve())
        .then(() => {
          logger.log(`Connected to database ${token}`);
        });
      return pool;
    }).pipe(handleRetry()),
  );
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
  poolName = DEFAULT_POOL_NAME,
  verboseRetryLog = false,
  toRetry?: (err: any) => boolean,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retry({
        count: retryAttempts,
        delay: (error, retryCount) => {
          if (toRetry && !toRetry(error)) {
            return throwError(() => error);
          }

          const poolInfo =
            poolName === DEFAULT_POOL_NAME ? '' : ` (${poolName})`;
          const verboseMessage = verboseRetryLog
            ? ` Message: ${error.message}.`
            : '';

          logger.error(
            format(
              'unable to connect to the database#%s.%s  Retrying (%s)',
              poolInfo,
              verboseMessage,
              retryCount,
            ),
            error.stack,
          );

          return of(null).pipe(delay(retryDelay));
        },
      }),
    );
}
