# Favicon Ignore Middleware Module

## Overview

`IgnoreFaviconModule` intercepts requests for `favicon.ico` and returns
`204 No Content`, preventing these requests from reaching route handlers or
generating 404 errors.

**When to use:**

- Applications without a favicon file
- APIs that want to suppress favicon request logs
- Applications where favicon requests should be handled silently

**When not to use:**

- Applications that serve a favicon file
- Applications using static file serving that handles favicon requests
- Applications behind a reverse proxy that handles favicon requests

## Public API

### `IgnoreFaviconModule`

NestJS module that applies favicon-ignoring middleware globally.

#### Static Methods

##### `IgnoreFaviconModule.forRoot()`

Configures the module. No options required.

**Returns:** `DynamicModule` - A configured NestJS module

##### `IgnoreFaviconModule.forRootAsync(options?)`

Asynchronously configures the module. Options are optional and typically unused.

**Parameters:**

- `options` (optional): Standard async module options (useFactory, imports,
  etc.)

**Returns:** `DynamicModule` - A configured NestJS module

## Usage Examples

### Basic Setup

```ts
import { Module } from '@nestjs/common';
import { IgnoreFaviconModule } from '@rineex/favicon-ignore-mw-module';

@Module({
  imports: [IgnoreFaviconModule.forRoot()],
})
export class AppModule {}
```

### Async Setup

```ts
import { Module } from '@nestjs/common';
import { IgnoreFaviconModule } from '@rineex/favicon-ignore-mw-module';

@Module({
  imports: [IgnoreFaviconModule.forRootAsync()],
})
export class AppModule {}
```

## Behavior & Guarantees

### Invariants

- Middleware applies to all routes (`forRoutes('*')`)
- Requests with `favicon.ico` in the URL path return `204 No Content`
- All other requests pass through unchanged
- No response body is sent for favicon requests

### Performance

- Minimal overhead: simple string check on request URL
- Early return prevents route handler execution for favicon requests

### Concurrency

- Stateless middleware; safe for concurrent requests
- No shared state between requests

## Operational Notes

### Configuration

No configuration options. The module works out of the box.

### Matching Logic

The middleware checks if `req.originalUrl` includes the string `'favicon.ico'`.
This matches:

- `/favicon.ico`
- `/path/to/favicon.ico`
- Any URL containing `favicon.ico` as a substring

### Common Pitfalls

1. **Path matching**: Matches any URL containing `favicon.ico`, not just
   `/favicon.ico`
2. **Case sensitivity**: Matching is case-sensitive; `Favicon.ico` won't match
3. **Query parameters**: URLs like `/favicon.ico?v=1` will match

### Logging

- No logging provided by this module
- Favicon requests return `204` without triggering route handlers or error
  handlers

## License

Apache-2.0
