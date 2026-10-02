# Rineex Core

Rineex Core is a pnpm workspace of framework-agnostic domain primitives and
reusable NestJS integrations. Published packages are built as CommonJS, ESM, and
TypeScript declarations from their `src/index.ts` entry points.

## Quick start

```bash
corepack enable
pnpm install
pnpm build
pnpm test
```

The workspace pins pnpm 10.22.0 and specifies Node 24.12.0 through Volta.
`@rineex/pg-slonik` supports Node 18 or later; use the root toolchain while
developing this repository.

## Package areas

| Area                   | Packages                                                  |
| ---------------------- | --------------------------------------------------------- |
| Domain building blocks | `@rineex/ddd`, `@rineex/decision-engine`                  |
| Authentication         | `@rineex/auth-core`, OTP and passwordless method packages |
| NestJS integrations    | Redis, Slonik/PostgreSQL, and HTTP middleware modules     |
| Tooling                | shared ESLint and TypeScript configurations               |

## Documentation

- [Development workflow](docs/development.md)
- [Architecture](docs/architecture.md)
- [Package catalog](docs/packages.md)
- [Decision engine](docs/decision-engine.md)
- [Authentication](docs/authentication.md)
- [NestJS integrations](docs/nestjs-integrations.md)
- [DDD primitives](docs/ddd.md)

Every package has a focused README next to its source. Package release history
remains in its `CHANGELOG.md`.
