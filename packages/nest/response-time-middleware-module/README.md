# Response Time Middleware Module

## Overview

`ResponseTimeModule` adds response time headers to HTTP responses, measuring the
time taken to process each request. This is useful for performance monitoring
and debugging.

**When to use:**

- Applications requiring response time metrics in headers
- APIs that need client-visible performance indicators
- Development environments for performance debugging

**When not to use:**

- Applications using APM tools that measure response times internally
- Applications behind reverse proxies that add response time headers
- Applications where header overhead is a concern

## Public API

### `ResponseTimeModule`

NestJS module that configures and applies response time middleware globally.

#### Static Methods

##### `ResponseTimeModule.forRoot(options?)`

Synchronously configures the module with response time options.

**Parameters:**

- `options` (optional): `ResponseTimeOptions` - Configuration options from
  `response-time` package
  - `digits` (optional): Number of decimal places (default: 3)
  - `header` (optional): Header name (default: 'X-Response-Time')
  - `suffix` (optional): Boolean to include 'ms' suffix (default: true)
  - `custom` (optional): Function to format the time value

**Returns:** `DynamicModule` - A configured NestJS module

##### `ResponseTimeModule.forRootAsync(options)`

Asynchronously configures the module.

**Parameters:**

- `options`: Object with one of:
  - `useFactory`:
    `(...args: any[]) => ResponseTimeOptions | Promise<ResponseTimeOptions>`
  - `useClass`: Constructor class
  - `useExisting`: Token for existing provider
  - `imports` (optional): Array of modules
  - `inject` (optional): Array of injection tokens

**Returns:** `DynamicModule` - A configured NestJS module

## Usage Examples

### Basic Setup

```ts
import { Module } from '@nestjs/common';
import { ResponseTimeModule } from '@rineex/response-time-mw-module';

@Module({
  imports: [ResponseTimeModule.forRoot()],
})
export class AppModule {}
```

### With Custom Header Name

```ts
import { Module } from '@nestjs/common';
import { ResponseTimeModule } from '@rineex/response-time-mw-module';

@Module({
  imports: [
    ResponseTimeModule.forRoot({
      header: 'X-Process-Time',
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResponseTimeModule } from '@rineex/response-time-mw-module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ResponseTimeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        header: config.get<string>('RESPONSE_TIME_HEADER', 'X-Response-Time'),
        digits: config.get<number>('RESPONSE_TIME_DIGITS', 3),
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
- Response time is measured from middleware execution start to response finish
- Header is set on all HTTP responses (including errors)
- Time is measured in milliseconds with configurable precision

### Performance

- Minimal overhead: uses `process.hrtime()` for high-resolution timing
- Header addition is synchronous and fast
- No external dependencies or network calls

### Concurrency

- Stateless middleware; safe for concurrent requests
- Each request measures its own response time independently
- No shared state between requests

## Operational Notes

### Configuration

Default behavior:

- Header name: `X-Response-Time`
- Format: `123.456ms` (with suffix)
- Precision: 3 decimal places

### Header Format

The response time header format depends on options:

- With suffix: `X-Response-Time: 123.456ms`
- Without suffix: `X-Response-Time: 123.456`
- Custom format: Use `custom` function option

### Common Pitfalls

1. **Timing accuracy**: Response time includes middleware execution time, not
   just route handler time
2. **Header visibility**: Headers are visible to clients; ensure this is
   intended
3. **Precision**: Higher precision (more digits) increases header size slightly
4. **Custom format**: Custom formatting functions should be fast to avoid
   affecting response time

### Logging

- No logging provided by this module
- Response time is only exposed via HTTP headers
- For logging, use middleware that reads the header value

## License

Apache-2.0
