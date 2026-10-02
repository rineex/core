# Package catalog

| Package                                      | Purpose                                               | Package guide                                                        |
| -------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| `@rineex/ddd`                                | Domain primitives, errors, results, and value objects | [README](../packages/ddd/README.md)                                  |
| `@rineex/decision-engine`                    | Deterministic candidate evaluation and selection      | [README](../packages/decision-engine/README.md)                      |
| `@rineex/auth-core`                          | Authentication domain contracts and types             | [README](../packages/authentication/core/README.md)                  |
| `@rineex/authentication-method-otp`          | OTP auth-method implementation                        | [README](../packages/authentication/methods/otp/README.md)           |
| `@rineex/authentication-method-passwordless` | Internal passwordless challenge implementation        | [README](../packages/authentication/methods/passwordless/README.md)  |
| `@rineex/ioredis`                            | NestJS Redis connection and health support            | [README](../packages/ioredis/README.md)                              |
| `@rineex/pg-slonik`                          | NestJS Slonik pool registration and injection         | [README](../packages/pg-slonik/README.md)                            |
| `@rineex/cookie-parser-mw-module`            | Cookie-parser middleware module                       | [README](../packages/nest/cookie-middleware-module/README.md)        |
| `@rineex/cors-mw-module`                     | CORS middleware module                                | [README](../packages/nest/cors-middleware-module/README.md)          |
| `@rineex/helmet-mw-module`                   | Helmet middleware module                              | [README](../packages/nest/helmet-middleware-module/README.md)        |
| `@rineex/favicon-ignore-mw-module`           | Favicon suppression middleware module                 | [README](../packages/nest/no-favicon-middleware-module/README.md)    |
| `@rineex/response-time-mw-module`            | Response-time middleware module                       | [README](../packages/nest/response-time-middleware-module/README.md) |
| `@rineex/libs`                               | Placeholder package with no public exports            | [README](../packages/libs/README.md)                                 |
| `@rineex/eslint-config`                      | Private shared ESLint flat configurations             | [README](../packages/eslint-config/README.md)                        |
| `@rineex/typescript-config`                  | Private shared TypeScript configurations              | [README](../packages/typescript-config/README.md)                    |

The two configuration packages are private workspace dependencies. They are
consumed by repository packages, not distributed as runtime application
dependencies.
