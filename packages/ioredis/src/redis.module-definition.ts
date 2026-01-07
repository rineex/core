import { ConfigurableModuleBuilder } from '@nestjs/common';

import type {
  RedisModuleExtraOptions,
  RedisModuleOptions,
} from './redis.interfaces';

import { createRedisConnection, getRedisConnectionToken } from './redis.utils';

export const {
  ConfigurableModuleClass: RedisModuleClass,
  MODULE_OPTIONS_TOKEN: REDIS_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE: RedisModuleAsyncOptions,
} = new ConfigurableModuleBuilder<RedisModuleOptions>()
  .setExtras<RedisModuleExtraOptions>(
    { connection: 'default' },
    (definition, extras) => {
      definition.providers ??= [];
      definition.exports ??= [];

      const REDIS_CONNECTION_TOKEN = getRedisConnectionToken(extras.connection);
      definition.providers.push({
        provide: REDIS_CONNECTION_TOKEN,
        inject: [REDIS_OPTIONS_TOKEN],

        useFactory: (options: RedisModuleOptions) => {
          return createRedisConnection(options);
        },
      });
      definition.exports.push(REDIS_CONNECTION_TOKEN);

      return definition;
    },
  )
  .build();
