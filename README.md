# Rineex Core

> A monorepo containing essential, production-grade packages for building
> scalable and maintainable TypeScript/Node.js applications.

> ⚠️ **Note**: This package is currently under heavy development. APIs may
> change without notice.

[![monorepo](https://img.shields.io/badge/monorepo-turbo-blue.svg)](https://turbo.build/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

## Overview

Rineex Core is a collection of carefully crafted, battle-tested packages
designed following Domain-Driven Design (DDD) principles and industry best
practices. Each package is independently versioned and published to npm,
enabling teams to adopt only what they need.

## Packages

### [`@rineex/ddd`](./packages/ddd) – Domain-Driven Design Framework

[![npm version](https://img.shields.io/npm/v/@rineex/ddd)](https://www.npmjs.com/package/@rineex/ddd)
[![npm downloads](https://img.shields.io/npm/dm/@rineex/ddd)](https://www.npmjs.com/package/@rineex/ddd)

A comprehensive, production-grade TypeScript library providing battle-tested
abstractions for implementing Domain-Driven Design patterns. Build maintainable,
scalable applications with type-safe entities, aggregates, value objects, and
domain events.

#### Quick Summary

- **Value Objects**: Immutable objects distinguished by value, not identity
- **Entities**: Objects with unique identity and lifecycle
- **Aggregate Roots**: Entry points to aggregates with invariant enforcement and
  event support
- **Domain Events**: Immutable records of significant domain occurrences
- **Application Services**: Orchestrators for use cases and commands
- **Zero Dependencies**: Lightweight with only peer dependencies

#### Key Features

✨ **Type-Safe Abstractions** - Fully typed base classes for all DDD building
blocks  
🔒 **Immutability by Default** - Value objects and entities are frozen to
prevent mutations  
📡 **Domain Events Support** - First-class support for event sourcing and
event-driven architectures  
✅ **Built-in Validation** - Enforce domain rules at aggregate boundaries  
⚡ **Zero Dependencies** - Minimal bundle footprint for maximum flexibility  
🏢 **Production Ready** - Used in high-performance systems at scale

#### Quick Start

```bash
npm install @rineex/ddd
```

```typescript
import {
  AggregateRoot,
  ValueObject,
  AggregateId,
  DomainEvent,
} from '@rineex/ddd';

// Define a Value Object
class Email extends ValueObject<string> {
  public static create(value: string) {
    return new Email(value);
  }
  protected validate(props: string): void {
    if (!props.includes('@')) throw new Error('Invalid email');
  }
}

// Create an Aggregate Root
interface UserProps {
  email: Email;
  isActive: boolean;
}

class User extends AggregateRoot<UserProps> {
  get email(): Email {
    return this.props.email;
  }
  protected validate(): void {
    if (!this.email) throw new Error('Email is required');
  }
}

// Use it
const user = new User({
  id: AggregateId.create(),
  createdAt: new Date(),
  props: { email: Email.create('user@example.com'), isActive: true },
});
```

#### Comprehensive Documentation

For in-depth guidance, examples, and best practices, see the
[**@rineex/ddd Documentation**](./packages/ddd/README.md):

- 📚 [Core Concepts Guide](./packages/ddd/README.md#core-concepts) - Value
  Objects, Entities, Aggregates, Events
- 🔧 [Complete API Reference](./packages/ddd/README.md#api-reference) - All
  classes, interfaces, and methods
- 💡 [Examples](./packages/ddd/README.md#examples) - Order aggregate and
  integration patterns
- ✅ [Best Practices](./packages/ddd/README.md#best-practices) - DDD patterns
  and principles
- 🚨 [Error Handling](./packages/ddd/README.md#error-handling) - Registry-backed
  domain errors and Result
- 🤝 [Contributing Guide](./packages/ddd/README.md#contributing) - Development
  setup and guidelines

#### Included Value Objects

- `AggregateId` - Unique identifier for aggregates
- `Email` - Email address validation
- `IPAddress` - IPv4/IPv6 validation

---

### [`@rineex/ioredis`](./packages/ioredis) – Redis Adapter for NestJS

[![npm version](https://img.shields.io/npm/v/@rineex/ioredis)](https://www.npmjs.com/package/@rineex/ioredis)

NestJS integration for [`ioredis`](https://www.npmjs.com/package/ioredis),
providing Redis client management with dependency injection, lifecycle
management, and health check integration.

#### Key Features

- **Multiple Connections** - Support for single instance or cluster
  configurations with named connections
- **Lifecycle Management** - Automatic connection health checks on bootstrap and
  graceful shutdown
- **Health Check Integration** - Built-in Terminus health indicator for
  monitoring
- **Dependency Injection** - Seamless NestJS DI integration with
  `@InjectRedis()` decorator

#### Quick Start

```bash
npm install @rineex/ioredis
```

```typescript
import { Module, Injectable } from '@nestjs/common';
import { InjectRedis, RedisModule } from '@rineex/ioredis';
import type Redis from 'ioredis';

@Module({
  imports: [
    RedisModule.register({
      type: 'single',
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    }),
  ],
})
export class AppModule {}

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setValue(key: string, value: string) {
    await this.redis.set(key, value);
  }
}
```

For complete documentation, see the
[@rineex/ioredis README](./packages/ioredis/README.md).

---

### [`@rineex/pg-slonik`](./packages/pg-slonik) – PostgreSQL Adapter using Slonik

[![npm version](https://img.shields.io/npm/v/@rineex/pg-slonik)](https://www.npmjs.com/package/@rineex/pg-slonik)

NestJS module wrapper for [Slonik](https://github.com/gajus/slonik), providing
type-safe PostgreSQL database access with dependency injection, automatic retry
logic, and graceful shutdown handling.

#### Key Features

- **Type-Safe Database Access** - Full TypeScript support with Slonik's type
  system
- **Multiple Connections** - Support for multiple named database connections
- **Automatic Retry Logic** - Built-in connection retry with configurable
  attempts and delays
- **SQL Safety** - Built-in SQL injection protection via Slonik's tagged
  template literals
- **Transaction Support** - First-class transaction handling

#### Quick Start

```bash
npm install @rineex/pg-slonik
```

```typescript
import { Module, Injectable } from '@nestjs/common';
import { InjectPool, SlonikModule } from '@rineex/pg-slonik';
import type { DatabasePool } from 'slonik';

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

For complete documentation, see the
[@rineex/pg-slonik README](./packages/pg-slonik/README.md).

---

### [`@rineex/auth-core`](./packages/authentication/core) – Authentication Core

[![npm version](https://img.shields.io/npm/v/@rineex/auth-core)](https://www.npmjs.com/package/@rineex/auth-core)

Core authentication package providing foundational abstractions for building
authentication systems. Designed following DDD principles with support for
multiple authentication methods.

#### Key Features

- **Domain-Driven Design** - Built on `@rineex/ddd` for maintainable
  authentication logic
- **Extensible Architecture** - OTP and passwordless method packages;
  `AuthMethodPort` plugin model
- **Type-Safe** - Full TypeScript support with strict typing
- **Framework Agnostic** - Core domain logic independent of framework specifics

See [Architecture.md](./packages/authentication/core/Architecture.md) for what
is implemented vs in-tree.

For complete documentation, see the
[@rineex/auth-core README](./packages/authentication/core/README.md).

---

### [`@rineex/libs`](./packages/libs) – Utility Libraries

[![npm version](https://img.shields.io/npm/v/@rineex/libs)](https://www.npmjs.com/package/@rineex/libs)

Shared utility libraries and helper functions for Rineex core modules.

---

### NestJS Middleware Modules

Production-ready NestJS middleware modules for common web application needs:

#### [`@rineex/helmet-mw-module`](./packages/nest/helmet-middleware-module)

[![npm version](https://img.shields.io/npm/v/@rineex/helmet-mw-module)](https://www.npmjs.com/package/@rineex/helmet-mw-module)

Helmet middleware module for securing HTTP headers in NestJS applications.

#### [`@rineex/cors-mw-module`](./packages/nest/cors-middleware-module)

[![npm version](https://img.shields.io/npm/v/@rineex/cors-mw-module)](https://www.npmjs.com/package/@rineex/cors-mw-module)

CORS middleware module for handling cross-origin resource sharing in NestJS
applications.

#### [`@rineex/cookie-parser-mw-module`](./packages/nest/cookie-middleware-module)

[![npm version](https://img.shields.io/npm/v/@rineex/cookie-parser-mw-module)](https://www.npmjs.com/package/@rineex/cookie-parser-mw-module)

Cookie parser middleware module for parsing cookies in NestJS applications.

#### [`@rineex/response-time-mw-module`](./packages/nest/response-time-middleware-module)

[![npm version](https://img.shields.io/npm/v/@rineex/response-time-mw-module)](https://www.npmjs.com/package/@rineex/response-time-mw-module)

Response time middleware module for measuring and reporting response times in
NestJS applications.

#### [`@rineex/favicon-ignore-mw-module`](./packages/nest/no-favicon-middleware-module)

[![npm version](https://img.shields.io/npm/v/@rineex/favicon-ignore-mw-module)](https://www.npmjs.com/package/@rineex/favicon-ignore-mw-module)

Favicon ignore middleware module to prevent favicon requests from cluttering
logs in NestJS applications.

---

### Shared Configuration Packages

#### [`@rineex/eslint-config`](./packages/eslint-config)

Shared ESLint configuration for Rineex packages. Provides consistent linting
rules across the monorepo.

**Exports:**

- `@rineex/eslint-config/base` - Base ESLint configuration
- `@rineex/eslint-config/next-js` - Next.js specific configuration
- `@rineex/eslint-config/react-internal` - React internal configuration
- `@rineex/eslint-config/db` - Database/SQL linting configuration

#### [`@rineex/typescript-config`](./packages/typescript-config)

Shared TypeScript configuration for Rineex packages. Provides consistent
TypeScript compiler settings.

**Exports:**

- `@rineex/typescript-config/base` - Base TypeScript configuration
- `@rineex/typescript-config/react-library` - React library configuration

---

## Project Structure

```
.
├── packages/
│   ├── ddd/                    # Domain-Driven Design framework
│   │   ├── src/
│   │   │   ├── domain/         # Core DDD building blocks
│   │   │   ├── application/    # Application service ports
│   │   │   ├── gateway/        # HTTP constants and utilities
│   │   │   └── utils/          # Helper utilities
│   │   ├── README.md           # Complete documentation
│   │   └── package.json
│   ├── ioredis/                # Redis adapter for NestJS
│   ├── pg-slonik/              # PostgreSQL adapter using Slonik
│   ├── libs/                   # Utility libraries
│   ├── authentication/         # Authentication packages
│   │   ├── core/              # @rineex/auth-core
│   │   └── methods/           # OTP, passwordless method packages
│   ├── nest/                  # NestJS middleware modules
│   │   ├── helmet-middleware-module/
│   │   ├── cors-middleware-module/
│   │   ├── cookie-middleware-module/
│   │   ├── response-time-middleware-module/
│   │   └── no-favicon-middleware-module/
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
├── scripts/                    # Build and utility scripts
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # PNPM workspace configuration
└── README.md
```

## Development

### Prerequisites

- **Node.js**: 18.0 or higher (Volta pins Node 24 in this repo)
- **pnpm**: 10.0 or higher (workspace uses pnpm 10.22)
- **TypeScript**: 5.9 or higher

### Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Check types
pnpm check-types
```

### Workspace Scripts

The monorepo uses [Turborepo](https://turbo.build/) for efficient task execution
across packages.

```bash
# Run command in all packages
pnpm turbo run build

# Run command in specific package
pnpm --filter @rineex/ddd build

# Watch mode for development
pnpm turbo run dev --parallel
```

## Publishing

Packages are published automatically through GitHub Actions when changes are
merged to the main branch. Version management is handled via
[Changesets](https://github.com/changesets/changesets).

### Creating a Changeset

```bash
pnpm changeset
```

Follow the prompts to document your changes. This will create a changeset file
that will be used to automatically bump versions and generate changelogs.

## Architecture Principles

This monorepo follows these key principles:

1. **Domain-Driven Design** - Clear separation of domain logic from
   infrastructure
2. **Type Safety** - Strict TypeScript configuration for compile-time safety
3. **Immutability** - Default-immutable data structures to prevent bugs
4. **Composition** - Small, focused packages that can be used independently
5. **Zero Dependencies** - Minimal external dependencies for reliability
6. **Testing** - Comprehensive test coverage with Vitest

## Contributing

We welcome contributions! Please follow these guidelines when contributing:

### Quick Start for Contributors

```bash
# Clone and setup
git clone https://github.com/rineex/core.git
cd core
pnpm install

# Create a feature branch
git checkout -b feature/your-feature

# Make changes and test
pnpm test
pnpm lint

# Push and open a PR
git push origin feature/your-feature
```

### Development Guidelines

- **Code Style**: Follow the ESLint configuration provided by
  `@rineex/eslint-config`
- **Type Safety**: Ensure all code passes TypeScript type checking
  (`pnpm check-types`)
- **Testing**: Write tests for new functionality and ensure all tests pass
- **Documentation**: Update relevant README files and add JSDoc comments for
  public APIs
- **Changesets**: Create a changeset for any package changes using
  `pnpm changeset`

### Package Generator

Use the package generator to scaffold new packages following the established
structure:

```bash
pnpm g:pkg <package-name> [description]
```

For more details, see [PACKAGE_GENERATOR.md](./PACKAGE_GENERATOR.md).

## Documentation Map

| Package / area      | Primary docs                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo            | [README.md](./README.md), [PACKAGE_GENERATOR.md](./PACKAGE_GENERATOR.md)                                                                                 |
| `@rineex/ddd`       | [packages/ddd/README.md](./packages/ddd/README.md)                                                                                                       |
| `@rineex/auth-core` | [packages/authentication/core/README.md](./packages/authentication/core/README.md), [Architecture.md](./packages/authentication/core/Architecture.md)    |
| Auth methods        | [passwordless README](./packages/authentication/methods/passwordless/README.md), [OTP README](./packages/authentication/methods/otp/README.md)           |
| `@rineex/pg-slonik` | [README](./packages/pg-slonik/README.md), [API](./packages/pg-slonik/docs/API.md)                                                                        |
| `@rineex/ioredis`   | [README](./packages/ioredis/README.md)                                                                                                                   |
| Nest middleware     | `packages/nest/*/README.md`                                                                                                                              |
| Domain sub-docs     | [auth errors](./packages/authentication/core/src/domain/errors/README.md), [auth VOs](./packages/authentication/core/src/domain/value-objects/README.md) |

## License

This project is licensed under the Apache License 2.0 - see the
[LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation** - See individual package READMEs
- 🐛 **Issues** - Report bugs on
  [GitHub Issues](https://github.com/rineex/core/issues)
- 💬 **Discussions** - Ask questions on
  [GitHub Discussions](https://github.com/rineex/core/discussions)

## Related Resources

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.domainlanguage.com/ddd/)
  by Eric Evans
- [Implementing Domain-Driven Design](https://vaughnvernon.com/books/) by Vaughn
  Vernon
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Made with ❤️ by the Rineex Team**
