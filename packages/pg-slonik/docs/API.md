# @rineex/pg-slonik — API Documentation

## 1. Overview

**What it does:** NestJS module that provides one or more
[Slonik](https://github.com/gajus/slonik) PostgreSQL connection pools as
injectable providers. Each connection is created with configurable DSN, optional
Slonik client options (including interceptors), and connection verification with
retries.

**Use when:**

- You need type-safe PostgreSQL access via Slonik in a NestJS app.
- You want multiple named pools (e.g. primary vs replica) or a single default
  pool.
- You need Slonik features (interceptors, type parsers, statement timeouts)
  passed through per connection.

**Do not use when:**

- You are not using NestJS.
- You need a different PostgreSQL client (e.g. raw `pg`, Prisma).

---

## 2. Public API

### Types (`slonik.interface.ts`)

| Symbol                     | Description                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `SlonikConnectionName`     | `string` — Name of the connection (used for injection token and logging).                                      |
| `SlonikConnectionTags`     | `string` — Tag type for connection metadata.                                                                   |
| `SlonikConnectionConfig`   | Per-connection config: `name`, `dsn`, optional `options` (Slonik `ClientConfigurationInput`), optional `tags`. |
| `SlonikModuleOptions`      | `{ connections: SlonikConnectionConfig[] }` — Required for `SlonikModule.register()`.                          |
| `SlonikModuleExtraOptions` | `{ isGlobal?: boolean }` — Default `isGlobal: true`; controls module scope.                                    |

### Module (`slonik.module.ts`)

| API                                    | Description                                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `SlonikModule.register(options)`       | Registers the module with the given connections. Returns a `DynamicModule` with one provider per connection and exports all pool tokens. |
| `SlonikModule#onApplicationShutdown()` | Ends all pools created by this module (called by Nest on shutdown).                                                                      |

**Parameters (register):**

- `options.connections` (required): Array of `SlonikConnectionConfig`.
- `options.isGlobal` (optional): If `true`, module is global (default from
  builder).

**Return (register):** NestJS `DynamicModule` with `providers` and `exports`
set. Each connection is provided under the token returned by
`createSlonikToken(conn.name)`.

### Utilities (`slonik.util.ts`)

| Function                         | Parameters                                                                           | Return                  | Description                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `createSlonikToken(name?)`       | `name` (optional, default `'DEFAULT'`)                                               | `string`                | DI token for the pool, e.g. `__SLONIK_DEFAULT_POOL__`. Name is uppercased.                                                    |
| `createSlonikConnection(config)` | `config: SlonikConnectionConfig`                                                     | `Promise<DatabasePool>` | Creates a Slonik pool via `createPool(dsn, options)`, verifies with `pool.connect()`, retries on failure (see `handleRetry`). |
| `handleRetry(...)`               | `retryAttempts=9`, `retryDelay=3000`, `poolName`, `verboseRetryLog`, `toRetry?(err)` | RxJS operator           | Retry operator for connection failures. If `toRetry` is provided, retries only when it returns `true`.                        |

**Errors:** `createSlonikConnection` rejects if the pool cannot be created or
the verification connect fails after all retries. Errors are logged with
`Logger` (SlonikModule).

### Decorator (`slonik.decorator.ts`)

| API                 | Parameters                             | Return              | Description                                                      |
| ------------------- | -------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| `InjectPool(name?)` | `name` (optional, default `'DEFAULT'`) | Parameter decorator | Injects the Slonik `DatabasePool` for the given connection name. |

### Module definition (`slonik.module-definition.ts`)

| Export                 | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `SlonikCoreModule`     | Base configurable module class.                              |
| `MODULE_OPTIONS_TOKEN` | Token to inject `SlonikModuleOptions` (with extras applied). |
| `OPTIONS_TYPE`         | Type of options for `register()`.                            |
| `ASYNC_OPTIONS_TYPE`   | Type for async registration.                                 |

### Constants (`constants/index.ts`)

| Constant            | Value                  | Description                                     |
| ------------------- | ---------------------- | ----------------------------------------------- |
| `SLONIK_POOL_TOKEN` | `'__SLONIK_%s_POOL__'` | Format string for pool injection token.         |
| `DEFAULT_POOL_NAME` | `'DEFAULT'`            | Default connection name when none is specified. |

---

## 3. Usage Examples

**Single default pool:**

```ts
import { Module } from '@nestjs/common';
import { SlonikModule } from '@rineex/pg-slonik';

@Module({
  imports: [
    SlonikModule.register({
      connections: [{ name: 'DEFAULT', dsn: process.env.DATABASE_URL! }],
    }),
  ],
})
export class AppModule {}
```

**Multiple pools with options and interceptors:**

```ts
SlonikModule.register({
  connections: [
    {
      name: 'primary',
      dsn: process.env.DATABASE_URL!,
      options: {
        maximumPoolSize: 20,
        statementTimeout: 60_000,
        interceptors: [myQueryLoggingInterceptor],
      },
    },
    {
      name: 'replica',
      dsn: process.env.DATABASE_REPLICA_URL!,
      options: { interceptors: [readOnlyInterceptor] },
    },
  ],
});
```

**Injecting the pool:**

```ts
import { InjectPool } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

@Injectable()
export class UserRepository {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    // or named: @InjectPool('replica') private readonly replica: DatabasePool,
  ) {}
}
```

**Async registration (e.g. from ConfigService):**

```ts
SlonikModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connections: [{ name: 'DEFAULT', dsn: config.getOrThrow('DATABASE_URL') }],
  }),
});
```

---

## 4. Behavior & Guarantees

- **Pool lifecycle:** Pools are created when the provider is first resolved
  (lazy). They are closed on `onApplicationShutdown()` via `pool.end()`;
  shutdown uses `Promise.allSettled` so one failure does not block others.
- **Retries:** Connection creation is wrapped in an RxJS `defer` +
  `handleRetry()`. Default: 9 retries, 3s delay. Only the initial
  connection/verification is retried; subsequent query failures are not retried
  by this module.
- **Token format:** Injection token is `__SLONIK_<UPPERCASE_NAME>_POOL__`.
  Connection names are case-insensitive for token creation (normalized to
  uppercase).
- **Options passthrough:** `SlonikConnectionConfig.options` is passed directly
  to Slonik’s `createPool(dsn, options)`. All Slonik options (e.g.
  `interceptors`, `typeParsers`, `statementTimeout`) are supported.

---

## 5. Operational Notes

- **Configuration:** Use environment variables or a config module for DSN and
  secrets; avoid hardcoding. For multiple connections, use distinct env vars and
  names.
- **Logging:** The module uses Nest `Logger` (scope `SlonikModule`) for
  connection success and retry errors. Enable Slonik’s own logging via
  `interceptors` or client options if you need query-level logs.
- **Pitfalls:**
  - Registering the same connection name twice in one app can lead to duplicate
    tokens; keep names unique per process.
  - `handleRetry` is applied only to the initial `createPool` + `connect`;
    ensure DSN and network are correct.
  - If you use `registerAsync`, ensure the factory returns the same shape as
    `register()` (e.g. `connections` array).
