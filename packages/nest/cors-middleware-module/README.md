# @rineex/cors-mw-module

NestJS module that applies `cors` middleware to every route.

```bash
pnpm add @rineex/cors-mw-module cors @nestjs/common @nestjs/core express
```

Import `CorsModule.register(options)` or `registerAsync`. Defaults enable
credentials, use the module's allowed methods and headers, and return `204` for
preflight responses. Passed `CorsOptions` override those defaults. The package
exports `CorsModule` and `CorsMiddleware`.

See [NestJS integrations](../../../docs/nestjs-integrations.md) for the shared
middleware pattern.
