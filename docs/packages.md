# Package catalog

The table lists every workspace package and its consumer-facing status. “Public
exports” refers only to the package root entry point.

| Package                                      | Purpose                                 | Runtime dependencies             | Public exports                                                     | Guide                                                                |
| -------------------------------------------- | --------------------------------------- | -------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `@rineex/ddd`                                | Domain primitives                       | `zod`, `uuid`, `rxjs`, utilities | Domain model, `Result`, errors, value objects, mapper              | [README](../packages/ddd/README.md)                                  |
| `@rineex/decision-engine`                    | Candidate selection pipeline            | none                             | Engine, models, strategies, events, in-memory publisher            | [README](../packages/decision-engine/README.md)                      |
| `@rineex/auth-core`                          | Authentication domain contracts         | `@rineex/ddd`                    | domain aggregates/types, policy engine, ports                      | [README](../packages/authentication/core/README.md)                  |
| `@rineex/authentication-method-otp`          | OTP auth method                         | auth core, DDD                   | `OtpAuthMethod`, `OtpChannelPort`                                  | [README](../packages/authentication/methods/otp/README.md)           |
| `@rineex/authentication-method-passwordless` | Passwordless implementation in progress | auth core, DDD                   | none                                                               | [README](../packages/authentication/methods/passwordless/README.md)  |
| `@rineex/ioredis`                            | Nest Redis adapter                      | Nest, ioredis, Terminus          | module, decorator, options, helpers, health indicator              | [README](../packages/ioredis/README.md)                              |
| `@rineex/pg-slonik`                          | Nest Slonik adapter                     | Nest, Slonik, RxJS               | module, injection decorator, module-definition types, token helper | [README](../packages/pg-slonik/README.md)                            |
| `@rineex/cookie-parser-mw-module`            | Global cookie middleware                | Nest, Express, cookie-parser     | module, middleware, `CookieParseOptions`                           | [README](../packages/nest/cookie-middleware-module/README.md)        |
| `@rineex/cors-mw-module`                     | Global CORS middleware                  | Nest, Express, cors              | module, middleware                                                 | [README](../packages/nest/cors-middleware-module/README.md)          |
| `@rineex/helmet-mw-module`                   | Global Helmet middleware                | Nest, Express, helmet            | module, middleware                                                 | [README](../packages/nest/helmet-middleware-module/README.md)        |
| `@rineex/favicon-ignore-mw-module`           | Ignore favicon requests                 | Nest, Express                    | module, middleware                                                 | [README](../packages/nest/no-favicon-middleware-module/README.md)    |
| `@rineex/response-time-mw-module`            | Global response-time middleware         | Nest, Express, response-time     | module, middleware, options type                                   | [README](../packages/nest/response-time-middleware-module/README.md) |
| `@rineex/libs`                               | Reserved shared-library package         | none                             | none                                                               | [README](../packages/libs/README.md)                                 |
| `@rineex/eslint-config`                      | Private ESLint configs                  | ESLint plugins                   | configuration entry points                                         | [README](../packages/eslint-config/README.md)                        |
| `@rineex/typescript-config`                  | Private TypeScript configs              | none                             | JSON configuration files                                           | [README](../packages/typescript-config/README.md)                    |

The [authentication](authentication.md), [decision engine](decision-engine.md),
[NestJS integrations](nestjs-integrations.md), and [DDD](ddd.md) guides contain
usage examples and behavior details.
