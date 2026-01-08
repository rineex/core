# CORS Middleware Module

## Overview

`CorsModule` integrates CORS (Cross-Origin Resource Sharing) middleware into
NestJS applications. It handles preflight OPTIONS requests and sets appropriate
CORS headers on responses.

**When to use:**

- APIs accessed from web browsers with different origins
- Applications requiring cross-origin requests with credentials
- REST APIs consumed by frontend applications

**When not to use:**

- Internal-only APIs not accessed from browsers
- APIs behind an API gateway that handles CORS
- Server-to-server communication only

## Public API

### `CorsModule`

NestJS module that configures and applies CORS middleware globally.

#### Static Methods

##### `CorsModule.forRoot(options?)`

Synchronously configures the module with CORS options.

**Parameters:**

- `options` (optional): `CorsOptions` - Configuration options from
  `@nestjs/common`
  - Merged with defaults: `credentials: true`, common HTTP methods, and standard
    headers
  - All standard CORS options supported (origin, methods, allowedHeaders, etc.)

**Returns:** `DynamicModule` - A configured NestJS module

##### `CorsModule.forRootAsync(options)`

Asynchronously configures the module.

**Parameters:**

- `options`: Object with one of:
  - `useFactory`: `(...args: any[]) => CorsOptions | Promise<CorsOptions>`
  - `useClass`: Constructor class
  - `useExisting`: Token for existing provider
  - `imports` (optional): Array of modules
  - `inject` (optional): Array of injection tokens

**Returns:** `DynamicModule` - A configured NestJS module

### Default Configuration

- `credentials: true` - Allows cookies/credentials in cross-origin requests
- `methods`: GET, POST, PUT, PATCH, DELETE
- `allowedHeaders`: Includes common headers (Content-Type, Authorization, custom
  x-\* headers, etc.)
- `preflightContinue: false` - Terminates preflight requests
- `optionsSuccessStatus: 204` - HTTP status for successful preflight

## Usage Examples

### Basic Setup

```ts
import { Module } from '@nestjs/common';
import { CorsModule } from '@rineex/cors-mw-module';

@Module({
  imports: [CorsModule.forRoot()],
})
export class AppModule {}
```

### With Custom Origin

```ts
import { Module } from '@nestjs/common';
import { CorsModule } from '@rineex/cors-mw-module';

@Module({
  imports: [
    CorsModule.forRoot({
      origin: 'https://example.com',
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CorsModule } from '@rineex/cors-mw-module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CorsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        origin: config.get<string>('ALLOWED_ORIGINS')?.split(','),
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
- Preflight OPTIONS requests are handled automatically
- Default options are merged with user-provided options (user options take
  precedence)
- CORS headers are set on all responses when conditions match

### Performance

- Minimal overhead per request
- Preflight requests are handled synchronously
- No caching of CORS decisions (evaluated per request)

### Concurrency

- Stateless middleware; safe for concurrent requests
- No shared state between requests

## Operational Notes

### Configuration

User-provided options override defaults. Common options:

- `origin`: String, array, or function returning allowed origins
- `methods`: Array of allowed HTTP methods
- `allowedHeaders`: Array of allowed request headers
- `exposedHeaders`: Array of headers exposed to client
- `credentials`: Boolean for allowing credentials
- `maxAge`: Number of seconds to cache preflight response

### Common Pitfalls

1. **Wildcard origin with credentials**: `origin: '*'` cannot be used with
   `credentials: true`
2. **Missing methods**: Ensure required HTTP methods are included
3. **Header case sensitivity**: Headers are case-insensitive per HTTP spec, but
   some clients are sensitive
4. **Preflight caching**: Set `maxAge` appropriately to reduce preflight
   requests

### Logging

- No logging provided by this module
- CORS rejections are handled silently (browser console shows errors)

## License

Apache-2.0
