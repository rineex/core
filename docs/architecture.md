# Architecture

Rineex Core is a library monorepo, not a runnable application. The root package
owns repository-wide tasks. Each library owns source, tests, build
configuration, package metadata, and a single public entry point.

## Layers and dependency direction

```text
@rineex/ddd
  └─ generic domain modeling, errors, results, mapper support
       └─ @rineex/auth-core
            └─ OTP and passwordless method packages

@rineex/decision-engine
  └─ standalone deterministic decision pipeline

Application composition root
  └─ NestJS adapters
       ├─ @rineex/ioredis
       ├─ @rineex/pg-slonik
       └─ HTTP middleware modules
            └─ third-party infrastructure
```

The dependency direction is intentional. Core domain packages should not import
NestJS, a database driver, or a transport. Nest adapters sit at the application
boundary and manage framework life cycles. `@rineex/decision-engine` is
independent of both groups.

## Public API contract

The supported API of a package is exactly the set of exports from its
`src/index.ts`. Do not import a package's other source files through a deep
path; those files may move, become private, or disappear without a compatibility
guarantee. The documentation identifies packages with deliberately empty entry
points so consumers do not mistake internal source for a supported API.

## Package output

Publishable libraries generally declare these fields:

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

tsup builds these outputs from `src/index.ts`. Configuration packages are
private workspace dependencies and intentionally expose configuration files
instead of runtime APIs.

## Choosing a package

- Model domain concepts and use explicit success/failure values with
  `@rineex/ddd`.
- Select candidates by constraints and weighted preferences with
  `@rineex/decision-engine`.
- Build authentication domain state/contracts with `@rineex/auth-core`; add OTP
  through its dedicated method package.
- Wire Redis or PostgreSQL into a Nest application with the matching Nest
  adapter.
- Apply common Express middleware globally in Nest with the middleware modules.

The [package catalog](packages.md) is the complete index; detailed guides
explain each integration boundary.
