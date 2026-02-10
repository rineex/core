import type { DatabasePool, Interceptor } from 'slonik';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SlonikModule } from './slonik.module';
import { createSlonikConnection } from './slonik.util';

vi.mock('./slonik.util', () => ({
  createSlonikToken: vi.fn(
    (name: string) => `__SLONIK_${name.toUpperCase()}_POOL__`,
  ),
  createSlonikConnection: vi.fn(),
}));

describe('slonikModule', () => {
  const mockPool = {
    connect: vi
      .fn()
      .mockImplementation((cb: (conn: unknown) => Promise<void>) => cb({})),
    end: vi.fn().mockResolvedValue(undefined),
  } as unknown as DatabasePool;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSlonikConnection).mockResolvedValue(mockPool);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('module registration', () => {
    it('should be defined', () => {
      expect(SlonikModule).toBeDefined();
    });

    it('should register with connections and provide pool tokens', async () => {
      const dynamicModule = SlonikModule.register({
        connections: [
          { name: 'default', dsn: 'postgresql://localhost/default' },
        ],
      });

      expect(dynamicModule.module).toBe(SlonikModule);
      expect(dynamicModule.providers).toBeDefined();
      expect(dynamicModule.providers!.length).toBeGreaterThan(0);
      expect(dynamicModule.exports).toEqual(['__SLONIK_DEFAULT_POOL__']);
    });

    it('should create provider that calls createSlonikConnection with connection config', async () => {
      const dsn = 'postgresql://user:pass@localhost/db';
      const connections = [{ name: 'main', dsn }];
      const dynamicModule = SlonikModule.register({ connections });
      const factoryProvider = (dynamicModule.providers ?? []).find(
        (p: any) => typeof p?.useFactory === 'function',
      ) as { useFactory: () => Promise<DatabasePool> };
      await factoryProvider.useFactory();

      expect(createSlonikConnection).toHaveBeenCalledWith({
        name: 'main',
        dsn,
        options: undefined,
      });
    });

    it('should pass options.interceptors to createSlonikConnection when provided', async () => {
      const interceptor: Interceptor = {
        name: 'mock',
        beforeQueryExecution: () => null,
      };
      const connections = [
        {
          name: 'with-interceptors',
          dsn: 'postgresql://localhost/db',
          options: { interceptors: [interceptor] },
        },
      ];
      const dynamicModule = SlonikModule.register({ connections });
      const factoryProvider = (dynamicModule.providers ?? []).find(
        (p: any) => typeof p?.useFactory === 'function',
      ) as { useFactory: () => Promise<DatabasePool> };
      await factoryProvider.useFactory();

      expect(createSlonikConnection).toHaveBeenCalledWith({
        name: 'with-interceptors',
        dsn: 'postgresql://localhost/db',
        options: { interceptors: [interceptor] },
      });
    });

    it('should register multiple connections and export all tokens', () => {
      const connections = [
        { name: 'write', dsn: 'postgresql://localhost/write' },
        { name: 'read', dsn: 'postgresql://localhost/read' },
      ];
      const dynamicModule = SlonikModule.register({ connections });

      expect(dynamicModule.exports).toEqual([
        '__SLONIK_WRITE_POOL__',
        '__SLONIK_READ_POOL__',
      ]);
    });
  });

  describe('options and interceptors in register', () => {
    it('should pass connections with options.interceptors to factory', async () => {
      const interceptor: Interceptor = {
        name: 'mock',
        afterQueryExecution: () => null,
      };
      const connections = [
        {
          name: 'default',
          dsn: 'postgresql://localhost/test',
          options: { interceptors: [interceptor] },
        },
      ];
      SlonikModule.register({ connections });
      const factoryProvider = (
        SlonikModule.register({ connections }).providers ?? []
      ).find((p: any) => typeof p?.useFactory === 'function') as {
        useFactory: () => Promise<DatabasePool>;
      };
      await factoryProvider.useFactory();

      expect(createSlonikConnection).toHaveBeenCalledWith({
        name: 'default',
        dsn: 'postgresql://localhost/test',
        options: { interceptors: [interceptor] },
      });
    });

    it('should resolve pool from factory when useFactory is invoked', async () => {
      const connections = [
        { name: 'default', dsn: 'postgresql://localhost/test' },
      ];
      const dynamicModule = SlonikModule.register({ connections });
      const factoryProvider = (dynamicModule.providers ?? []).find(
        (p: any) => typeof p?.useFactory === 'function',
      ) as { useFactory: () => Promise<DatabasePool> };
      const pool = await factoryProvider.useFactory();

      expect(pool).toBe(mockPool);
    });
  });

  describe('onApplicationShutdown', () => {
    it('should implement onApplicationShutdown', () => {
      const module = new SlonikModule();

      expect(module.onApplicationShutdown).toBeDefined();
      expect(typeof module.onApplicationShutdown).toBe('function');
    });

    it('should call pool.end() for registered pools on shutdown', async () => {
      const connections = [
        { name: 'default', dsn: 'postgresql://localhost/test' },
      ];
      const dynamicModule = SlonikModule.register({ connections });
      const factoryProvider = (dynamicModule.providers ?? []).find(
        (p: any) => typeof p?.useFactory === 'function',
      ) as { useFactory: () => Promise<DatabasePool> };
      await factoryProvider.useFactory();

      const module = new SlonikModule();
      await module.onApplicationShutdown();

      expect(mockPool.end).toHaveBeenCalledWith();
    });
  });
});
