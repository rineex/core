import type { Cluster, RedisOptions } from 'ioredis';
import Redis from 'ioredis';

import {
  REDIS_MODULE_CONNECTION,
  REDIS_MODULE_CONNECTION_TOKEN,
  REDIS_MODULE_OPTIONS_TOKEN,
} from './redis.constants';
import type { RedisModuleOptions } from './redis.interfaces';
import { RedisModule } from './redis.module';

export function getRedisOptionsToken(connection?: string): string {
  return `${connection || REDIS_MODULE_CONNECTION}_${REDIS_MODULE_OPTIONS_TOKEN}`;
}

export function getRedisConnectionToken(connection?: string): string {
  return `${connection || REDIS_MODULE_CONNECTION}_${REDIS_MODULE_CONNECTION_TOKEN}`;
}

export function createRedisConnection(options: RedisModuleOptions) {
  const { options: commonOptions = {}, type } = options;

  let client: Cluster | Redis;
  if (type === 'cluster') {
    client = new Redis.Cluster(options.nodes, commonOptions);
  } else {
    const { options: { port, host } = {}, url } = options;
    const redisOptions: RedisOptions = { ...commonOptions, port, host };
    client = url ? new Redis(url, redisOptions) : new Redis(redisOptions);
  }

  return RedisModule.track(client);
}
