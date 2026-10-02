# NestJS integrations

These packages adapt third-party infrastructure to NestJS dependency injection
and lifecycle hooks. Install a module together with the peer dependencies
declared in its package metadata. The HTTP middleware packages configure all
routes with `forRoutes('*')`.

## Redis

```bash
pnpm add @rineex/ioredis ioredis @nestjs/common @nestjs/terminus
```

Register a single connection with a URL or ioredis options:

```ts
import { Module } from '@nestjs/common';
import { InjectRedis, RedisModule } from '@rineex/ioredis';
import type Redis from 'ioredis';

@Module({
  imports: [
    RedisModule.register(
      { type: 'single', url: process.env.REDIS_URL },
      { connection: 'cache' },
    ),
  ],
})
export class AppModule {}

class CacheService {
  constructor(@InjectRedis('cache') private readonly redis: Redis) {}
}
```

For a cluster, use `{ type: 'cluster', nodes, options }`.
`getRedisConnectionToken(connection?)` and `getRedisOptionsToken(connection?)`
expose the generated injection-token strings. `RedisModule` is global, tracks
created clients, pings them during application bootstrap, and attempts `quit()`
for every tracked client on shutdown.

`RedisHealthModule` exports `RedisHealthIndicator`. Its `isHealthy(key)` pings
the configured health client and returns the Terminus `up` or `down` result. The
health client is supplied through the `REDIS_HEALTH_INDICATOR` provider token.

## PostgreSQL through Slonik

```bash
pnpm add @rineex/pg-slonik slonik @nestjs/common
```

```ts
import { Module } from '@nestjs/common';
import { InjectPool, SlonikModule } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

@Module({
  imports: [
    SlonikModule.register({
      connections: [
        { name: 'DEFAULT', dsn: process.env.DATABASE_URL! },
        { name: 'replica', dsn: process.env.REPLICA_DATABASE_URL! },
      ],
    }),
  ],
})
export class AppModule {}

class UserRepository {
  constructor(
    @InjectPool() private readonly writer: DatabasePool,
    @InjectPool('replica') private readonly reader: DatabasePool,
  ) {}
}
```

Every configured connection has `name`, `dsn`, optional Slonik `options`, and
optional `tags`. `InjectPool(name?)` injects the matching pool;
`createSlonikToken(name?)` produces its token. The module is global by default;
set the configurable-module extra `isGlobal: false` when module-local scope is
required.

`createSlonikConnection` creates a pool, verifies it through `pool.connect`, and
retries failures. `handleRetry` defaults to nine retries and a three-second
delay; it accepts alternative attempt count, delay, pool name, verbose logging,
and retry predicate. `SlonikModule` ends registered pools during shutdown. The
current public `SlonikModule.register` override accepts only the connection
options, so its configurable-module `isGlobal` extra remains at its default
`true` through that public method.

## Global HTTP middleware

Each middleware module supports Nest's generated `register` and `registerAsync`
methods. Import one module once at an appropriate application level.

```ts
@Module({
  imports: [
    CookieParserModule.register({ secret: process.env.COOKIE_SECRET }),
    CorsModule.register({ origin: ['https://app.example.com'] }),
    HelmetModule.register(),
    IgnoreFaviconModule.register(),
    ResponseTimeModule.register({ header: 'X-Response-Time', digits: 1 }),
  ],
})
export class HttpModule {}
```

| Package/module        | Options and behavior                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CookieParserModule`  | Passes `CookieParseOptions` to `cookie-parser` for every request.                                                                                          |
| `CorsModule`          | Passes `CorsOptions` to `cors`. Defaults: credentials enabled, module allowed methods/headers, `204` preflight status; supplied options override defaults. |
| `HelmetModule`        | Passes `HelmetOptions` to `helmet`.                                                                                                                        |
| `IgnoreFaviconModule` | No meaningful options; returns `204` if `req.originalUrl` contains `favicon.ico`, otherwise calls next.                                                    |
| `ResponseTimeModule`  | Passes `digits`, `header`, and `suffix` options to `response-time`.                                                                                        |

These modules are Express-oriented: their middleware types use Express
request/response objects, so install the listed Express peer dependency and use
them with a compatible Nest HTTP adapter.
