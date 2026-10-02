# @rineex/helmet-mw-module

NestJS module that applies `helmet` middleware to every route.

```bash
pnpm add @rineex/helmet-mw-module helmet @nestjs/common @nestjs/core express
```

Import `HelmetModule.register(options)` with `HelmetOptions`, or use
`registerAsync`. The package exports `HelmetModule` and `HelmetMiddleware`.

See [NestJS integrations](../../../docs/nestjs-integrations.md) for the shared
middleware pattern.
