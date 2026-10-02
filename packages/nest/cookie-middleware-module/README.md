# @rineex/cookie-parser-mw-module

NestJS module that applies `cookie-parser` middleware to every route.

```bash
pnpm add @rineex/cookie-parser-mw-module cookie-parser @nestjs/common @nestjs/core express
```

Import `CookieParserModule.register(options)` with `CookieParseOptions`, or use
`registerAsync`. The package exports `CookieParserModule`,
`CookieParserMiddleware`, and the upstream `CookieParseOptions` type.

See [NestJS integrations](../../../docs/nestjs-integrations.md) for the shared
middleware pattern.
