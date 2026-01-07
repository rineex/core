## Overview

`@rineex/ioredis` provides a NestJS integration for
[`ioredis`](https://www.npmjs.com/package/ioredis), including:

- Creating and exporting Redis clients (single instance or cluster) via a
  configurable module (`RedisModule`)
- Injecting clients by name via `@InjectRedis()`
- Basic lifecycle management:
  - On application bootstrap: ping all tracked clients and log results
  - On application shutdown: `quit()` all tracked clients
- A Terminus health indicator and module (`RedisHealthIndicator`,
  `RedisHealthModule`)

Use this when:

- You want an `ioredis` client managed by NestJS DI, with support for multiple
  named connections.
- You want the module to close Redis connections on shutdown.

Do not use this when:

- You do not use NestJS DI (you can use `ioredis` directly).
- You need a different Redis library than `ioredis`.

## Public API

### Exports

The package exports:

- `RedisModule`
- `InjectRedis`
- `RedisHealthIndicator`, `RedisHealthModule`
- `RedisModuleOptions`, `RedisModuleExtraOptions`
- `getRedisConnectionToken`, `getRedisOptionsToken`

### `RedisModule`

A NestJS configurable module for provisioning an `ioredis` client and exporting
it under a DI token.

- **register(options: RedisModuleOptions, extras?: RedisModuleExtraOptions)**
  - **options**:
    - `type: 'single' | 'cluster'`
    - If `type: 'single'`:
      - `url?: string`
      - `options?: import('ioredis').RedisOptions`
    - If `type: 'cluster'`:
      - `nodes: import('ioredis').ClusterNode[]`
      - `options?: import('ioredis').ClusterOptions`
  - **extras**:
    - `connection?: string` (default: `'default'`)
  - **returns**: a dynamic Nest module that exports a provider for the client.

- **registerAsync(...)**
  - Async variant; the factory must resolve to `RedisModuleOptions`.
  - Supports the same `extras.connection` naming behavior.

### Injection helpers

- **InjectRedis(connection?: string)**
  - Parameter decorator that injects the `ioredis` client for the given
    connection name.
  - If `connection` is omitted, injects the default connection (`'default'`).

- **getRedisConnectionToken(connection?: string): string**
  - Returns the DI token used to register/inject the client.

- **getRedisOptionsToken(connection?: string): string**
  - Returns the DI token used internally for module options for a given
    connection.

### Health check integration

- **RedisHealthModule**
  - Nest module exporting `RedisHealthIndicator`.
  - Provides a `REDIS_HEALTH_INDICATOR` client via a factory that calls
    `new Redis()` with default settings.

- **RedisHealthIndicator**
  - `isHealthy(key: string): Promise<import('@nestjs/terminus').HealthIndicatorResult>`
  - **Behavior**:
    - `PING` succeeds → returns healthy status for `key`
    - `PING` fails → throws `HealthCheckError` with a status payload including
      `message`

## Usage Examples

### Single Redis (default connection)

```ts
import { Module, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { InjectRedis, RedisModule } from '@rineex/ioredis';

@Module({
  imports: [
    RedisModule.register({
      type: 'single',
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    }),
  ],
})
export class AppModule {}

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setValue(key: string, value: string) {
    await this.redis.set(key, value);
  }
}
```

### Named connection

```ts
@Module({
  imports: [
    RedisModule.register(
      { type: 'single', url: 'redis://localhost:6380' },
      { connection: 'cache' },
    ),
  ],
})
export class AppModule {}
```

```ts
@Injectable()
export class CacheService {
  constructor(@InjectRedis('cache') private readonly redis: Redis) {}
}
```

### Cluster

```ts
import type { Cluster } from 'ioredis';
import { Module, Injectable } from '@nestjs/common';
import { InjectRedis, RedisModule } from '@rineex/ioredis';

@Module({
  imports: [
    RedisModule.register(
      {
        type: 'cluster',
        nodes: [{ host: '127.0.0.1', port: 7000 }],
      },
      { connection: 'cluster' },
    ),
  ],
})
export class AppModule {}

@Injectable()
export class ClusterService {
  constructor(@InjectRedis('cluster') private readonly cluster: Cluster) {}
}
```

### Terminus health check

```ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@rineex/ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.redis.isHealthy('redis')]);
  }
}
```

## Behavior & Guarantees

- **Connection naming**: if `extras.connection` is omitted, the connection name
  is `'default'`.
- **Lifecycle**:
  - Clients created by `RedisModule` are tracked via `WeakRef` and pinged during
    `onApplicationBootstrap()`.
  - On shutdown, the module attempts to `quit()` each tracked client; failures
    are logged and do not throw.
- **Concurrency**: clients are shared singletons per DI token; concurrent use
  follows `ioredis` semantics.

## Operational Notes

- **Configuration**
  - For single instances, prefer a `url` (e.g. `redis://host:6379`) and pass
    `options` for advanced settings.
  - For cluster, supply `nodes` and optional `ClusterOptions`.
- **Logging**
  - Bootstrap health checks log ping success/failure per client.
  - Shutdown logs success or error when closing connections.
- **Health module default client**
  - `RedisHealthModule` creates a fresh `new Redis()` with default
    configuration; override the `REDIS_HEALTH_INDICATOR` provider if you need to
    health-check a configured/named connection instead of the default.

## Development

```bash
pnpm build
pnpm test
pnpm lint
pnpm check-types
```

## License

Apache-2.0
