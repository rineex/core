import type { Cluster } from 'ioredis';
import type Redis from 'ioredis';

import type {
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Global, Logger, Module } from '@nestjs/common';

import { RedisModuleClass } from './redis.module-definition';

@Module({})
@Global()
export class RedisModule
  extends RedisModuleClass
  implements OnApplicationShutdown, OnApplicationBootstrap
{
  private static readonly redisConnections = [] as WeakRef<Cluster | Redis>[];
  private readonly logger = new Logger(RedisModule.name);

  static track(redis: Cluster | Redis) {
    this.redisConnections.push(new WeakRef(redis));
    return redis;
  }

  async onApplicationBootstrap() {
    this.logger.log('Checking Redis connections health...');
    const clients = RedisModule.redisConnections
      .map(ref => ref.deref())
      .filter((client): client is Cluster | Redis => !!client);

    await Promise.all(
      clients.map(async (client, index) => {
        try {
          const result = await client.ping();
          this.logger.log(`Redis client #${index} responded: ${result}`);
        } catch (error) {
          this.logger.error(
            `Redis client #${index} ping failed: ${error.message}`,
          );
        }
      }),
    );
  }

  async onApplicationShutdown() {
    await Promise.allSettled(
      RedisModule.redisConnections
        .map(ref => ref.deref())
        .filter((client): client is Cluster | Redis => !!client)
        .map(client => this.tryCloseRedisConnectionPermanently(client)),
    );
  }

  private async tryCloseRedisConnectionPermanently(redis: Cluster | Redis) {
    try {
      await redis.quit();
      this.logger.log('Redis connection closed successfully.');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }
}
