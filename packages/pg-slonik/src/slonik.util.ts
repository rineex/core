import type { Observable } from 'rxjs';
import type { DatabasePool } from 'slonik';

import { Logger } from '@nestjs/common';
import { format } from 'node:util';
import { defer, delay, lastValueFrom, of, retry, throwError } from 'rxjs';
import { createPool } from 'slonik';

import type { SlonikConnectionConfig } from './slonik.interface';

import { DEFAULT_POOL_NAME, SLONIK_POOL_TOKEN } from './constants';

/**
 * Builds the Nest injection token for a named Slonik pool.
 *
 * @param name - Connection name (default: DEFAULT_POOL_NAME). Normalized to uppercase in token.
 * @returns Token string, e.g. '__SLONIK_DEFAULT_POOL__'.
 */
export const createSlonikToken = (name: string = DEFAULT_POOL_NAME) =>
  format(SLONIK_POOL_TOKEN, name.toUpperCase());

const logger = new Logger('SlonikModule');

/**
 * Creates a Slonik pool, verifies connectivity with pool.connect(), and retries on failure.
 * Options (including interceptors) are passed through to createPool.
 *
 * @param config - Connection config (name, dsn, optional options).
 * @returns Promise resolving to the Slonik DatabasePool.
 * @throws If connection or verification fails after all retries.
 */
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

/**
 * RxJS operator that retries the source observable on error (e.g. connection failure).
 * Logs each retry via SlonikModule logger. Optional predicate controls which errors are retried.
 *
 * @param retryAttempts - Max retry count (default 9).
 * @param retryDelay - Delay in ms between retries (default 3000).
 * @param poolName - Name used in log messages (default DEFAULT_POOL_NAME).
 * @param verboseRetryLog - If true, include error message in logs.
 * @param toRetry - Optional (err) => boolean; retry only when true. Omit to retry all errors.
 * @returns RxJS operator function.
 */
export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
  poolName = DEFAULT_POOL_NAME,
  verboseRetryLog = false,
  toRetry?: (err: unknown) => boolean,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retry({
        count: retryAttempts,
        delay: (error: unknown, retryCount) => {
          if (toRetry && !toRetry(error)) {
            return throwError(() => error);
          }

          const poolInfo =
            poolName === DEFAULT_POOL_NAME ? '' : ` (${poolName})`;
          const errMessage =
            error instanceof Error ? error.message : String(error);
          const verboseMessage = verboseRetryLog
            ? ` Message: ${errMessage}.`
            : '';

          logger.error(
            format(
              'unable to connect to the database#%s.%s  Retrying (%s)%s',
              poolInfo,
              verboseMessage,
              retryCount,
              verboseMessage ? '' : ` Error: ${errMessage}`,
            ),
          );

          return of(null).pipe(delay(retryDelay));
        },
      }),
    );
}
