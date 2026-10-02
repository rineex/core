# @rineex/response-time-mw-module

NestJS module that applies `response-time` middleware to every route.

```bash
pnpm add @rineex/response-time-mw-module response-time @nestjs/common @nestjs/core express
```

Import `ResponseTimeModule.register(options)` or `registerAsync`. Supported
options are `digits`, `header`, and `suffix`. The package exports
`ResponseTimeModule`, `ResponseTimeMiddleware`, and `ResponseTimeOptions`.

See [NestJS integrations](../../../docs/nestjs-integrations.md) for the shared
middleware pattern.
