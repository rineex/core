# @rineex/ioredis

NestJS support for named ioredis single-node or cluster connections, plus a
Terminus-compatible health indicator.

```bash
pnpm add @rineex/ioredis ioredis @nestjs/common @nestjs/terminus
```

Register `RedisModule` with either a single URL/options object or cluster nodes,
then inject a tracked client with `@InjectRedis(connectionName)`. The module
pings tracked clients on bootstrap and closes them on shutdown. Import
`RedisHealthModule` to use `RedisHealthIndicator.isHealthy(key)`.

See [NestJS integrations](../../docs/nestjs-integrations.md) for usage.
