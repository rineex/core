# Architecture

Rineex Core is a library monorepo, not an application. The root package
orchestrates workspace-wide build, test, lint, formatting, and release commands.
Each package owns its source, build configuration, tests, and public entry
point.

## Dependency direction

`@rineex/ddd` supplies general domain abstractions. Authentication packages
build on it. The decision engine is standalone. NestJS integration packages
adapt third-party infrastructure to Nest's dependency-injection lifecycle and
should remain at the edge of an application.

```text
@rineex/ddd ──> @rineex/auth-core ──> authentication method packages

application ──> @rineex/decision-engine
application ──> NestJS integration packages ──> Redis / Slonik / Express middleware
```

## Public API rule

Treat only a package's `src/index.ts` exports as its supported API. Source files
not exported there are implementation details, even when they are visible in the
repository. This protects consumers from deep-import breakage and keeps
documentation aligned with published artifacts.

## Build artifacts

Packages declare `main`, `module`, and `types` paths under `dist/`; tsup
produces those artifacts. Configuration packages are private workspace
dependencies and expose configuration files rather than a runtime library entry
point.
