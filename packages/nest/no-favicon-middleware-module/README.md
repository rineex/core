# @rineex/favicon-ignore-mw-module

NestJS module that returns HTTP `204` for requests whose original URL contains
`favicon.ico`.

```bash
pnpm add @rineex/favicon-ignore-mw-module @nestjs/common @nestjs/core express
```

Import `IgnoreFaviconModule.register()` or `registerAsync`. The package exports
`IgnoreFaviconModule` and `IgnoreFaviconMiddleware`.

See [NestJS integrations](../../../docs/nestjs-integrations.md) for the shared
middleware pattern.
