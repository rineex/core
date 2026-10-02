# @rineex/pg-slonik

NestJS integration for named Slonik PostgreSQL pools. Pools are verified with
retries, injectable by name, and closed on application shutdown.

```bash
pnpm add @rineex/pg-slonik slonik @nestjs/common
```

Call `SlonikModule.register({ connections })`; each connection has a name,
PostgreSQL DSN, and optional Slonik options. Use `@InjectPool()` for `DEFAULT`
or `@InjectPool('replica')` for another configured name.

See [NestJS integrations](../../docs/nestjs-integrations.md) for a full module
example.
