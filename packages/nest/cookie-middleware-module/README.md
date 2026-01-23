# Cookie Parser Middleware Module

## Overview

`CookieParserModule` is a NestJS module that integrates the `cookie-parser`
middleware into NestJS applications. It parses HTTP request cookies and makes
them available via `req.cookies` and `req.signedCookies`.

**When to use:**

- Applications that need to read HTTP cookies from incoming requests
- Applications using cookie-based authentication or session management
- Applications that need signed cookie support

**When not to use:**

- Applications that only set cookies but never read them
- Applications using alternative cookie parsing libraries
- Applications that handle cookies at a different layer (e.g., API gateway)

## Public API

### `CookieParserModule`

A NestJS module that configures and applies cookie parsing middleware globally.

#### Static Methods

##### `CookieParserModule.forRoot(options?)`

Synchronously configures the module with cookie parser options.

**Parameters:**

- `options` (optional): `CookieParseOptions` - Configuration options for
  cookie-parser
  - `secret` (optional): `string | string[]` - Secret(s) for signing cookies. If
    provided, enables signed cookie support via `req.signedCookies`
  - All other options from `cookie-parser` are supported

**Returns:** `DynamicModule` - A configured NestJS module

**Example:**

```ts
CookieParserModule.forRoot({
  secret: 'my-secret-key',
});
```

##### `CookieParserModule.forRootAsync(options)`

Asynchronously configures the module, useful when options depend on other
providers or configuration.

**Parameters:**

- `options`: Object with one of:
  - `useFactory`:
    `(...args: any[]) => CookieParseOptions | Promise<CookieParseOptions>` -
    Factory function
  - `useClass`: Constructor class implementing
    `ConfigurableModuleOptionsFactory`
  - `useExisting`: Token for existing provider
  - `imports` (optional): Array of modules to import
  - `inject` (optional): Array of injection tokens for factory dependencies

**Returns:** `DynamicModule` - A configured NestJS module

**Example:**

```ts
CookieParserModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    secret: config.get('COOKIE_SECRET'),
  }),
  inject: [ConfigService],
});
```

### `CookieParserMiddleware`

Internal middleware class that wraps `cookie-parser`. Not intended for direct
use.

## Usage Examples

### Basic Setup

```ts
import { Module } from '@nestjs/common';
import { CookieParserModule } from '@rineex/cookie-parser-mw-module';

@Module({
  imports: [CookieParserModule.forRoot()],
})
export class AppModule {}
```

### With Secret for Signed Cookies

```ts
import { Module } from '@nestjs/common';
import { CookieParserModule } from '@rineex/cookie-parser-mw-module';

@Module({
  imports: [
    CookieParserModule.forRoot({
      secret: 'your-secret-key',
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CookieParserModule } from '@rineex/cookie-parser-mw-module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CookieParserModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('COOKIE_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Accessing Cookies in Controllers

```ts
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get()
  getCookies(@Req() req: Request) {
    // Regular cookies
    const regularCookie = req.cookies?.sessionId;

    // Signed cookies (if secret is configured)
    const signedCookie = req.signedCookies?.token;

    return { regularCookie, signedCookie };
  }
}
```

## Behavior & Guarantees

### Invariants

- Middleware is applied to all routes (`forRoutes('*')`)
- Middleware runs before route handlers
- `req.cookies` is always an object (empty if no cookies)
- `req.signedCookies` is available only if a secret is configured
- Invalid or tampered signed cookies are excluded from `req.signedCookies` but
  logged as errors

### Performance

- Cookie parsing is synchronous and lightweight
- Parsing occurs once per request
- No caching or memoization (stateless per request)

### Concurrency

- Stateless middleware; safe for concurrent requests
- No shared state between requests

## Operational Notes

### Configuration

The module accepts all options from `cookie-parser`'s `CookieParseOptions`:

- `secret`: Enables signed cookie verification
- Multiple secrets: Pass an array to support secret rotation

### Cookie Access

After middleware execution:

- `req.cookies`: Plain cookies as key-value pairs
- `req.signedCookies`: Verified signed cookies (only if secret configured)

### Common Pitfalls

1. **Missing secret for signed cookies**: If you set signed cookies but don't
   configure a secret, they won't appear in `req.signedCookies`
2. **Secret mismatch**: Signed cookies created with one secret won't verify with
   a different secret
3. **Order matters**: Ensure `CookieParserModule` is imported before modules
   that depend on cookies
4. **Route-specific application**: The middleware applies to all routes. For
   selective application, use the middleware directly instead of this module

### Logging

- Invalid signed cookies are logged as errors by `cookie-parser`
- No additional logging is provided by this module

## License

Apache-2.0
