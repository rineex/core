import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cluster as ClusterType, Redis as RedisType } from 'ioredis';
import RedisImpl, { Cluster as ClusterImpl } from 'ioredis';

import { Test } from '@nestjs/testing';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { RedisModule } from './redis.module';
import { getRedisConnectionToken } from './redis.utils';

vi.mock('ioredis', () => {
  class MockRedis {
    static instances: any[] = [];
    quit = vi.fn().mockResolvedValue(undefined);
    constructor(...args: any[]) {
      MockRedis.instances.push(this);
    }
  }

  class MockCluster {
    static instances: any[] = [];
    quit = vi.fn().mockResolvedValue(undefined);
    constructor(...args: any[]) {
      MockCluster.instances.push(this);
    }
  }

  // Ensure `new Redis.Cluster()` works by attaching named export to default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (MockRedis as any).Cluster = MockCluster;

  return {
    __esModule: true,
    default: MockRedis,
    Cluster: MockCluster,
  };
});

describe('RedisModule', () => {
  beforeEach(() => {
    (RedisImpl as any).instances = [];
    (ClusterImpl as any).instances = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register single redis connection (non-global)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RedisModule.register({
          type: 'single',
          url: 'redis://localhost:6379',
          connection: 'main',
        }),
      ],
    }).compile();

    const conn = moduleRef.get<RedisType>(getRedisConnectionToken('main'));
    expect(conn).toBeInstanceOf(RedisImpl as any);
    expect((RedisImpl as any).instances).toHaveLength(1);
  });

  it('should register cluster redis connection (global)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RedisModule.register({
          type: 'cluster',
          nodes: [{ host: '127.0.0.1', port: 7000 }],
          connection: 'cluster',
        }),
      ],
    }).compile();

    const conn = moduleRef.get<ClusterType>(getRedisConnectionToken('cluster'));
    expect(conn).toBeInstanceOf(ClusterImpl as any);
    expect((ClusterImpl as any).instances).toHaveLength(1);
  });

  it('should call quit on shutdown', async () => {
    @Module({
      imports: [
        RedisModule.register({
          type: 'single',
          url: 'redis://localhost:6379',
        }),
      ],
    })
    class TestAppModule {}

    const appContext =
      await NestFactory.createApplicationContext(TestAppModule);
    await appContext.close();

    const redis = (RedisImpl as any).instances[0];
    expect(redis.quit).toHaveBeenCalledTimes(1);
  });

  it('should support registerAsync', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RedisModule.registerAsync({
          useFactory: async () => ({
            type: 'single',
            url: 'redis://localhost:6380',
          }),
        }),
      ],
    }).compile();

    const conn = moduleRef.get<RedisType>(getRedisConnectionToken('default'));
    expect(conn).toBeInstanceOf(RedisImpl as any);
    expect((RedisImpl as any).instances).toHaveLength(1);
  });
});
