import type { Interceptor } from 'slonik';

import { describe, expect, it } from 'vitest';

import type {
  SlonikConnectionConfig,
  SlonikConnectionName,
  SlonikConnectionTags,
  SlonikModuleExtraOptions,
  SlonikModuleOptions,
} from './slonik.interface';

describe('slonikConnectionConfig', () => {
  describe('shape and required fields', () => {
    it('should accept minimal config with name and dsn', () => {
      const config: SlonikConnectionConfig = {
        name: 'default',
        dsn: 'postgresql://user:pass@localhost:5432/db',
      };

      expect(config.name).toBe('default');
      expect(config.dsn).toBe('postgresql://user:pass@localhost:5432/db');
      expect(config.options).toBeUndefined();
      expect(config.tags).toBeUndefined();
    });

    it('should accept config with optional tags', () => {
      const config: SlonikConnectionConfig = {
        name: 'replica',
        dsn: 'postgresql://localhost/replica',
        tags: ['readonly', 'replica'],
      };

      expect(config.tags).toEqual(['readonly', 'replica']);
    });

    it('should accept config with optional options (ClientConfigurationInput)', () => {
      const config: SlonikConnectionConfig = {
        name: 'main',
        dsn: 'postgresql://localhost/main',
        options: {
          maximumPoolSize: 20,
          statementTimeout: 30_000,
        },
      };

      expect(config.options?.maximumPoolSize).toBe(20);
      expect(config.options?.statementTimeout).toBe(30_000);
    });
  });

  describe('options.interceptors', () => {
    it('should accept options with interceptors array', () => {
      const mockInterceptor: Interceptor = {
        name: 'mock',
        beforeQueryExecution: () => null,
      };
      const config: SlonikConnectionConfig = {
        name: 'pool-with-interceptors',
        dsn: 'postgresql://localhost/db',
        options: {
          interceptors: [mockInterceptor],
        },
      };

      expect(config.options?.interceptors).toHaveLength(1);
      expect(config.options?.interceptors?.[0]).toBe(mockInterceptor);
    });

    it('should accept multiple interceptors in execution order', () => {
      const interceptor1: Interceptor = {
        name: 'mock1',
        beforeQueryExecution: () => null,
      };
      const interceptor2: Interceptor = {
        name: 'mock2',
        afterQueryExecution: () => null,
      };
      const config: SlonikConnectionConfig = {
        name: 'multi',
        dsn: 'postgresql://localhost/db',
        options: {
          interceptors: [interceptor1, interceptor2],
        },
      };

      expect(config.options?.interceptors).toHaveLength(2);
      expect(config.options?.interceptors?.[0]).toHaveProperty(
        'beforeQueryExecution',
      );
      expect(config.options?.interceptors?.[1]).toHaveProperty(
        'afterQueryExecution',
      );
    });

    it('should accept interceptor with full lifecycle hooks', () => {
      const interceptor: Interceptor = {
        name: 'full-mock',
        beforePoolConnection: () => null,
        afterPoolConnection: () => null,
        beforeQueryExecution: () => null,
        afterQueryExecution: () => null,
        beforePoolConnectionRelease: () => null,
        beforeQueryResult: () => null,
        beforeTransformQuery: () => null,
        transformQuery: (_, query) => query,
        transformRow: (_, __, row) => row,
        queryExecutionError: () => null,
      };
      const config: SlonikConnectionConfig = {
        name: 'full',
        dsn: 'postgresql://localhost/db',
        options: { interceptors: [interceptor] },
      };

      expect(config.options?.interceptors?.[0]).toEqual(interceptor);
    });

    it('should allow empty interceptors array', () => {
      const config: SlonikConnectionConfig = {
        name: 'no-interceptors',
        dsn: 'postgresql://localhost/db',
        options: { interceptors: [] },
      };

      expect(config.options?.interceptors).toEqual([]);
    });

    it('should allow options without interceptors (optional)', () => {
      const config: SlonikConnectionConfig = {
        name: 'other-options',
        dsn: 'postgresql://localhost/db',
        options: {
          captureStackTrace: true,
          connectionTimeout: 10_000,
        },
      };

      expect(config.options?.interceptors).toBeUndefined();
    });
  });

  describe('slonikConnectionName and SlonikConnectionTags', () => {
    it('should allow string for connection name', () => {
      const name: SlonikConnectionName = 'DEFAULT';

      expect(name).toBe('DEFAULT');
    });

    it('should allow string for tags', () => {
      const tags: SlonikConnectionTags[] = ['tag1', 'tag2'];

      expect(tags).toEqual(['tag1', 'tag2']);
    });
  });
});

describe('slonikModuleOptions', () => {
  it('should accept connections array', () => {
    const options: SlonikModuleOptions = {
      connections: [{ name: 'default', dsn: 'postgresql://localhost/default' }],
    };

    expect(options.connections).toHaveLength(1);
    expect(options.connections[0].name).toBe('default');
  });

  it('should accept multiple connections with different options and interceptors', () => {
    const interceptor: Interceptor = {
      name: 'mock',
      beforeQueryExecution: () => null,
    };
    const options: SlonikModuleOptions = {
      connections: [
        { name: 'write', dsn: 'postgresql://localhost/write' },
        {
          name: 'read',
          dsn: 'postgresql://localhost/read',
          options: { interceptors: [interceptor] },
        },
      ],
    };

    expect(options.connections).toHaveLength(2);
    expect(options.connections[1].options?.interceptors).toHaveLength(1);
  });
});

describe('slonikModuleExtraOptions', () => {
  it('should accept isGlobal boolean', () => {
    const extra: SlonikModuleExtraOptions = { isGlobal: true };

    expect(extra.isGlobal).toBe(true);
  });

  it('should allow isGlobal to be undefined', () => {
    const extra: SlonikModuleExtraOptions = {};

    expect(extra.isGlobal).toBeUndefined();
  });
});
