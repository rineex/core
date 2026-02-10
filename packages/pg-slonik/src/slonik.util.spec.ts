import type { DatabasePool, Interceptor } from 'slonik';

import { defer, lastValueFrom, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_POOL_NAME } from './constants';
import {
  createSlonikConnection,
  createSlonikToken,
  handleRetry,
} from './slonik.util';

vi.mock('slonik', () => ({
  createPool: vi.fn(),
}));

describe('createSlonikToken', () => {
  it('should return token with name placeholder when given a name', () => {
    expect(createSlonikToken('MY_POOL')).toBe('__SLONIK_MY_POOL_POOL__');
  });

  it('should use default pool name when no name provided', () => {
    expect(createSlonikToken()).toBe('__SLONIK_DEFAULT_POOL__');
  });

  it('should uppercase the name in the token', () => {
    expect(createSlonikToken('replica')).toBe('__SLONIK_REPLICA_POOL__');
  });
});

describe('createSlonikConnection', () => {
  const mockConnect = vi.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    vi.clearAllMocks();
    const { createPool } = await import('slonik');
    vi.mocked(createPool).mockResolvedValue({
      connect: mockConnect,
      end: vi.fn().mockResolvedValue(undefined),
    } as unknown as DatabasePool);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call createPool with dsn and no options when options omitted', async () => {
    const { createPool } = await import('slonik');
    await createSlonikConnection({
      name: 'test',
      dsn: 'postgresql://localhost/testdb',
    });

    expect(createPool).toHaveBeenCalledOnce();
    expect(createPool).toHaveBeenCalledWith(
      'postgresql://localhost/testdb',
      undefined,
    );
  });

  it('should call createPool with dsn and options when options provided', async () => {
    const { createPool } = await import('slonik');
    await createSlonikConnection({
      name: 'test',
      dsn: 'postgresql://localhost/testdb',
      options: {
        maximumPoolSize: 10,
        statementTimeout: 5000,
      },
    });

    expect(createPool).toHaveBeenCalledOnce();
    expect(createPool).toHaveBeenCalledWith('postgresql://localhost/testdb', {
      maximumPoolSize: 10,
      statementTimeout: 5000,
    });
  });

  it('should pass options.interceptors to createPool', async () => {
    const { createPool } = await import('slonik');
    const interceptor: Interceptor = {
      name: 'mock',
      beforeQueryExecution: () => null,
    };
    await createSlonikConnection({
      name: 'with-interceptors',
      dsn: 'postgresql://localhost/db',
      options: {
        interceptors: [interceptor],
      },
    });

    expect(createPool).toHaveBeenCalledWith(
      'postgresql://localhost/db',
      expect.objectContaining({
        interceptors: [interceptor],
      }),
    );
  });

  it('should pass multiple interceptors to createPool', async () => {
    const { createPool } = await import('slonik');
    const interceptor1: Interceptor = {
      name: 'mock1',
      beforeQueryExecution: () => null,
    };
    const interceptor2: Interceptor = {
      name: 'mock2',
      afterQueryExecution: () => null,
    };
    await createSlonikConnection({
      name: 'multi',
      dsn: 'postgresql://localhost/db',
      options: {
        interceptors: [interceptor1, interceptor2],
      },
    });

    expect(createPool).toHaveBeenCalledWith(
      'postgresql://localhost/db',
      expect.objectContaining({
        interceptors: [interceptor1, interceptor2],
      }),
    );
  });

  it('should return the pool from createPool', async () => {
    const { createPool } = await import('slonik');
    const mockPool = {
      connect: mockConnect,
      end: vi.fn().mockResolvedValue(undefined),
    } as unknown as DatabasePool;
    vi.mocked(createPool).mockResolvedValue(mockPool);

    const pool = await createSlonikConnection({
      name: 'test',
      dsn: 'postgresql://localhost/db',
    });

    expect(pool).toBe(mockPool);
  });

  it('should call pool.connect to verify connection', async () => {
    await createSlonikConnection({
      name: 'test',
      dsn: 'postgresql://localhost/db',
    });

    expect(mockConnect).toHaveBeenCalledOnce();

    const cb = mockConnect.mock.calls[0][0];

    expect(typeof cb).toBe('function');
    await expect(cb()).resolves.toBeUndefined();
  });
});

describe('handleRetry', () => {
  it('should return an observable operator function', () => {
    const operator = handleRetry();

    expect(typeof operator).toBe('function');
    expect(operator).toHaveLength(1);
  });

  it('should pass through value when source emits successfully', async () => {
    const operator = handleRetry(1, 0);
    const value = await lastValueFrom(of('value').pipe(operator));

    expect(value).toBe('value');
  });

  it('should retry on error and then fail after count exhausted', async () => {
    let attempts = 0;
    const operator = handleRetry(2, 10);
    const source = defer(() => {
      attempts++;
      return throwError(() => new Error('fail'));
    }).pipe(operator);

    await expect(lastValueFrom(source)).rejects.toThrow('fail');
    expect(attempts).toBe(3); // initial + 2 retries
  });

  it('should use toRetry predicate when provided and stop retrying when it returns false', async () => {
    let attempts = 0;
    const operator = handleRetry(
      5,
      10,
      DEFAULT_POOL_NAME,
      false,
      (err: Error) => {
        attempts++;
        return err.message !== 'do-not-retry';
      },
    );
    const source = defer(() =>
      throwError(() => new Error('do-not-retry')),
    ).pipe(operator);

    await expect(lastValueFrom(source)).rejects.toThrow('do-not-retry');
    expect(attempts).toBe(1);
  });
});
