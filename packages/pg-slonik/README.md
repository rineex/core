# @rineex/pg-slonik

> NestJS module for PostgreSQL using Slonik. Provides type-safe database
> connection management with dependency injection, automatic retry logic, and
> graceful shutdown handling.

[![npm version](https://img.shields.io/npm/v/@rineex/pg-slonik)](https://www.npmjs.com/package/@rineex/pg-slonik)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
  - [Slonik version and third-party interceptors](#slonik-version-and-third-party-interceptors)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## Overview

`@rineex/pg-slonik` is a NestJS module wrapper for
[Slonik](https://github.com/gajus/slonik), providing seamless integration with
NestJS dependency injection, automatic connection retry logic, and graceful
shutdown handling.

### Key Features

- **NestJS Integration**: Full NestJS module support with dependency injection
- **Multiple Connections**: Support for multiple named database connections
- **Type-Safe Database Access**: Full TypeScript support with Slonik's type
  system
- **Automatic Retry Logic**: Built-in connection retry with configurable
  attempts and delays
- **Graceful Shutdown**: Automatic pool cleanup on application shutdown
- **SQL Safety**: Built-in SQL injection protection via Slonik
- **Transaction Support**: First-class transaction handling
- **Production Ready**: Used in high-performance systems at scale

## Installation

Install the package and its **peer dependencies** (slonik and NestJS). Using the
same major version of slonik as this package avoids type errors with
interceptors (see
[Slonik version and third-party interceptors](#slonik-version-and-third-party-interceptors)).

```bash
# npm
npm install @rineex/pg-slonik slonik@^48 @nestjs/common@^11

# pnpm
pnpm add @rineex/pg-slonik slonik@^48 @nestjs/common@^11

# yarn
yarn add @rineex/pg-slonik slonik@^48 @nestjs/common@^11
```

If you already have `@nestjs/common` and `slonik` in your app, ensure they
satisfy the peer ranges (`@nestjs/common` ^11.0.0, `slonik` ^48.0.0). Your
package manager will warn if versions are incompatible.

### Requirements

- **Node.js**: 18.0 or higher
- **TypeScript**: 5.0 or higher (recommended: 5.9+)
- **PostgreSQL**: 12.0 or higher
- **@nestjs/common**: 11.0 or higher
- **slonik**: ^48.0.0 (this package pins slonik 48.x)

### Slonik version and third-party interceptors

This package depends on **slonik ^48**. If you use third-party interceptors
(e.g.
[slonik-interceptor-field-name-transformation](https://www.npmjs.com/package/slonik-interceptor-field-name-transformation)),
they **must** target the same slonik major version.

If your app or another dependency pulls in a different slonik major (e.g. 39.x),
you will see a TypeScript error like:

```text
Type 'Interceptor' is not assignable to type 'Interceptor'.
  Types of property 'afterPoolConnection' are incompatible.
  ...
  Type 'QuerySqlToken<T>' is not assignable to type 'QuerySqlToken<ZodType<...>>'.
```

That happens because `Interceptor` and `CommonQueryMethods` changed between
slonik 39 (Zod-based) and 48 (different schema types). Two copies of slonik
means two incompatible `Interceptor` types.

**Fix:** Use a single slonik 48 everywhere. Install slonik and any slonik-based
interceptors with the same major as this package:

```bash
pnpm add slonik@^48 slonik-interceptor-field-name-transformation@^48
```

In a pnpm/yarn workspace, ensure the app that uses `@rineex/pg-slonik` and the
interceptors resolves to one slonik 48 (e.g. list the example app in the
workspace and use `slonik: "^48.0.0"` in that app’s `package.json` so the
lockfile deduplicates to a single version).

## Quick Start

Here's a minimal example to get started with NestJS:

```typescript
import { Module } from '@nestjs/common';
import { SlonikModule } from '@rineex/pg-slonik';

@Module({
  imports: [
    SlonikModule.register({
      connections: [
        {
          name: 'DEFAULT',
          dsn: 'postgresql://user:password@localhost:5432/database',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

Then inject the pool in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPool } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

@Injectable()
export class UserService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  async findUser(id: string) {
    const result = await this.pool.query(
      this.pool.sql`SELECT * FROM users WHERE id = ${id}`,
    );
    return result.rows[0];
  }
}
```

## API Reference

### `SlonikModule`

NestJS module for managing Slonik database connections.

#### `SlonikModule.register(options: SlonikModuleOptions): DynamicModule`

Registers the Slonik module with the provided configuration.

**Parameters:**

- `options.connections` (required): Array of connection configurations
  - `connection.name` (required): Unique name for the connection (default:
    'DEFAULT')
  - `connection.dsn` (required): PostgreSQL connection string (DSN)
  - `connection.options` (optional): Slonik `ClientConfigurationInput` options
  - `connection.tags` (optional): Array of connection tags
- `options.isGlobal` (optional): Whether the module should be global (default:
  true)

**Returns:** A configured NestJS `DynamicModule`

### `InjectPool(name?: string)`

Decorator for injecting a Slonik database pool into a class.

**Parameters:**

- `name` (optional): Name of the connection to inject (default: 'DEFAULT')

**Returns:** A NestJS `Inject` decorator

**Example:**

```typescript
@Injectable()
export class MyService {
  constructor(@InjectPool('DEFAULT') private readonly pool: DatabasePool) {}
}
```

### Type Exports

- `SlonikConnectionConfig`: Configuration interface for a single connection
- `SlonikModuleOptions`: Module configuration interface
- `SlonikModuleExtraOptions`: Additional module options (e.g., `isGlobal`)

## Examples

### Basic Module Setup

```typescript
import { Module } from '@nestjs/common';
import { SlonikModule } from '@rineex/pg-slonik';

@Module({
  imports: [
    SlonikModule.register({
      connections: [
        {
          name: 'DEFAULT',
          dsn: process.env.DATABASE_URL!,
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### Multiple Connections

```typescript
import { Module } from '@nestjs/common';
import { SlonikModule } from '@rineex/pg-slonik';

@Module({
  imports: [
    SlonikModule.register({
      connections: [
        {
          name: 'DEFAULT',
          dsn: process.env.DATABASE_URL!,
        },
        {
          name: 'ANALYTICS',
          dsn: process.env.ANALYTICS_DATABASE_URL!,
          options: {
            maximumPoolSize: 5,
            statementTimeout: 30000,
          },
        },
      ],
    }),
  ],
})
export class AppModule {}
```

### Service with Dependency Injection

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPool } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

@Injectable()
export class UserService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  async findAll() {
    const result = await this.pool.query(
      this.pool.sql`SELECT id, email FROM users LIMIT 10`,
    );
    return result.rows;
  }

  async findById(id: string) {
    const result = await this.pool.query(
      this.pool.sql`SELECT * FROM users WHERE id = ${id}`,
    );
    return result.rows[0] || null;
  }
}
```

### Using Named Connections

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPool } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectPool('ANALYTICS') private readonly analyticsPool: DatabasePool,
  ) {}

  async getMetrics() {
    const result = await this.analyticsPool.query(
      this.analyticsPool.sql`SELECT * FROM metrics ORDER BY created_at DESC`,
    );
    return result.rows;
  }
}
```

### Transaction Handling

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPool } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

@Injectable()
export class UserService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  async createUserWithProfile(userId: string, email: string, name: string) {
    await this.pool.transaction(async transactionConnection => {
      await transactionConnection.query(
        transactionConnection.sql`
          INSERT INTO users (id, email) VALUES (${userId}, ${email})
        `,
      );

      await transactionConnection.query(
        transactionConnection.sql`
          INSERT INTO user_profiles (user_id, name) VALUES (${userId}, ${name})
        `,
      );
    });
  }
}
```

### Repository Pattern

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPool } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

interface User {
  id: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class UserRepository {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  async findById(id: string) {
    const result = await this.pool.query(
      this.pool.sql`
        SELECT * FROM users WHERE id = ${id}
      `,
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Map database row to domain object
    return this.mapToUser(result.rows[0]);
  }

  async save(user: User) {
    await this.pool.query(
      this.pool.sql`
        INSERT INTO users (id, email, created_at)
        VALUES (${user.id}, ${user.email}, ${user.createdAt})
        ON CONFLICT (id) DO UPDATE
        SET email = ${user.email}
      `,
    );
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    };
  }
}
```

### Advanced Configuration

```typescript
import { Module } from '@nestjs/common';
import { SlonikModule } from '@rineex/pg-slonik';

@Module({
  imports: [
    SlonikModule.register({
      connections: [
        {
          name: 'DEFAULT',
          dsn: process.env.DATABASE_URL!,
          options: {
            maximumPoolSize: 20,
            idleTimeout: 5000,
            statementTimeout: 60000,
            connectionTimeout: 10000,
            interceptors: [
              // Add custom interceptors here
            ],
          },
          tags: ['primary', 'read-write'],
        },
      ],
      isGlobal: true, // Make the module global
    }),
  ],
})
export class AppModule {}
```

## Best Practices

### 1. **Use Dependency Injection**

Always inject the pool using the `@InjectPool()` decorator instead of creating
pools manually:

```typescript
// ❌ BAD: Creating pools manually
const pool = await createPool(connectionString);

// ✅ GOOD: Using dependency injection
@Injectable()
export class MyService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}
}
```

### 2. **Automatic Pool Cleanup**

The module automatically closes all connection pools on application shutdown.
You don't need to manually handle cleanup:

```typescript
// ✅ GOOD: Automatic cleanup via OnApplicationShutdown
// The SlonikModule handles this automatically
```

### 3. **Use Tagged Template Literals**

Always use Slonik's `sql` tagged template literal for queries to prevent SQL
injection:

```typescript
// ❌ BAD: String concatenation (SQL injection risk)
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ GOOD: Tagged template literal
const query = this.pool.sql`SELECT * FROM users WHERE id = ${userId}`;
```

### 4. **Handle Transactions Properly**

Use transactions for operations that must be atomic:

```typescript
await this.pool.transaction(async transactionConnection => {
  // All queries in this block are part of the same transaction
  await transactionConnection.query(/* ... */);
  await transactionConnection.query(/* ... */);
  // Transaction commits automatically if no errors
});
```

### 5. **Map Database Rows to Domain Objects**

Keep database concerns separate from domain logic:

```typescript
// ❌ BAD: Exposing database rows directly
async getUser(id: string) {
  const result = await this.pool.query(/* ... */);
  return result.rows[0]; // Raw database row
}

// ✅ GOOD: Mapping to domain objects
async getUser(id: string) {
  const result = await this.pool.query(/* ... */);
  return this.mapToUser(result.rows[0]); // Domain object
}
```

### 6. **Use Named Connections for Multiple Databases**

When working with multiple databases, use named connections:

```typescript
// ✅ GOOD: Named connections for different databases
SlonikModule.register({
  connections: [
    { name: 'DEFAULT', dsn: process.env.DATABASE_URL! },
    { name: 'ANALYTICS', dsn: process.env.ANALYTICS_DB_URL! },
  ],
});

// Then inject the specific connection
@InjectPool('ANALYTICS') private readonly analyticsPool: DatabasePool
```

### 7. **Configure Connection Options**

Use the `options` field to configure pool behavior:

```typescript
SlonikModule.register({
  connections: [
    {
      name: 'DEFAULT',
      dsn: process.env.DATABASE_URL!,
      options: {
        maximumPoolSize: 20,
        statementTimeout: 60000,
        // Add other Slonik configuration options
      },
    },
  ],
});
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write** tests for new functionality
4. **Ensure** all tests pass (`pnpm test`)
5. **Follow** the code style (`pnpm lint`)
6. **Commit** with clear messages
7. **Push** to the branch and create a Pull Request

### Development Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linter
pnpm lint

# Check types
pnpm check-types

# Build the package
pnpm build
```

## License

This project is licensed under the Apache License 2.0 - see the
[LICENSE](../../LICENSE) file for details.

## Related Resources

- [Slonik Documentation](https://github.com/gajus/slonik)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)

## Support

For issues, questions, or suggestions, please open an issue on
[GitHub](https://github.com/rineex/core/issues).

---

**Made with ❤️ by the Rineex Team**
