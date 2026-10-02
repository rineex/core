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

- [Development workflow](docs/development.md) — prerequisites, workspace
  commands, testing, releases, and package generation.
- [Architecture](docs/architecture.md) — module boundaries, dependency
  direction, and public API rules.
- [Package catalog](docs/packages.md) — package names, dependencies, exports,
  and supported status.
- [API reference](docs/api-reference.md) — public export inventory and
  package-specific contracts.
- [Decision engine](docs/decision-engine.md) — pipeline behavior, complete
  selection example, events, and extension points.
- [Authentication](docs/authentication.md) — core contracts, policy evaluation,
  OTP integration, and current passwordless boundary.
- [NestJS integrations](docs/nestjs-integrations.md) — Redis, Slonik, middleware
  configuration, and lifecycle behavior.
- [DDD primitives](docs/ddd.md) — value objects, entities, aggregates, events,
  results, errors, and mappers.
- [LLM and agent reference](llms.txt) — a single machine-oriented entry point
  that links to the authoritative human guides.

Every package has a focused README beside its source. Package release history
remains in its `CHANGELOG.md`.
