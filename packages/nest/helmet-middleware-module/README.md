# Helmet Middleware Module

## Overview

`HelmetModule` integrates Helmet security middleware into NestJS applications.
Helmet sets various HTTP security headers to help protect against common web
vulnerabilities.

**When to use:**

- Web applications exposed to browsers
- APIs that serve HTML content
- Applications requiring security header compliance (CSP, HSTS, etc.)

**When not to use:**

- Internal-only APIs not accessed from browsers
- APIs behind a reverse proxy that sets security headers
- Applications with custom security header requirements that conflict with
  Helmet defaults

## Public API

### `HelmetModule`

NestJS module that configures and applies Helmet middleware globally.

#### Static Methods

##### `HelmetModule.forRoot(options?)`

Synchronously configures the module with Helmet options.

**Parameters:**

- `options` (optional): `HelmetOptions` - Configuration options from `helmet`
  package
  - Supports all Helmet sub-middleware options (contentSecurityPolicy, hsts,
    frameguard, etc.)
  - If omitted, uses Helmet's default secure configuration

**Returns:** `DynamicModule` - A configured NestJS module

##### `HelmetModule.forRootAsync(options)`

Asynchronously configures the module.

**Parameters:**

- `options`: Object with one of:
  - `useFactory`: `(...args: any[]) => HelmetOptions | Promise<HelmetOptions>`
  - `useClass`: Constructor class
  - `useExisting`: Token for existing provider
  - `imports` (optional): Array of modules
  - `inject` (optional): Array of injection tokens

**Returns:** `DynamicModule` - A configured NestJS module

## Usage Examples

### Basic Setup

```ts
import { Module } from '@nestjs/common';
import { HelmetModule } from '@rineex/helmet-mw-module';

@Module({
  imports: [HelmetModule.forRoot()],
})
export class AppModule {}
```

### With Custom Options

```ts
import { Module } from '@nestjs/common';
import { HelmetModule } from '@rineex/helmet-mw-module';

@Module({
  imports: [
    HelmetModule.forRoot({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HelmetModule } from '@rineex/helmet-mw-module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HelmetModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        hsts: {
          maxAge: config.get<number>('HSTS_MAX_AGE', 31536000),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Behavior & Guarantees

### Invariants

- Middleware applies to all routes (`forRoutes('*')`)
- Security headers are set on all HTTP responses
- Default configuration enables all Helmet sub-middlewares with secure defaults

### Performance

- Minimal overhead per request
- Header setting is synchronous
- No external dependencies or network calls

### Concurrency

- Stateless middleware; safe for concurrent requests
- No shared state between requests

## Operational Notes

### Configuration

Helmet options include:

- `contentSecurityPolicy`: Content Security Policy headers
- `hsts`: HTTP Strict Transport Security
- `frameguard`: X-Frame-Options header
- `noSniff`: X-Content-Type-Options header
- `xssFilter`: X-XSS-Protection header
- `referrerPolicy`: Referrer-Policy header
- And other security-related headers

### Common Pitfalls

1. **CSP breaking third-party scripts**: Overly strict Content Security Policy
   can block legitimate resources
2. **HSTS in development**: Long HSTS maxAge can cause issues during local
   development
3. **Iframe embedding**: Default frameguard blocks iframe embedding; disable if
   needed for embeddable widgets
4. **Content-Type sniffing**: `noSniff` prevents MIME type sniffing, which may
   break some legacy clients

### Logging

- No logging provided by this module
- Helmet errors are handled internally and don't affect request processing

## License

Apache-2.0
