# Rineex Core

> A monorepo containing essential, production-grade packages for building scalable and maintainable TypeScript/Node.js applications.

[![monorepo](https://img.shields.io/badge/monorepo-turbo-blue.svg)](https://turbo.build/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

## Overview

Rineex Core is a collection of carefully crafted, battle-tested packages designed following Domain-Driven Design (DDD) principles and industry best practices. Each package is independently versioned and published to npm, enabling teams to adopt only what they need.

## Packages

### [`@rineex/ddd`](./packages/ddd) – Domain-Driven Design Framework

[![npm version](https://img.shields.io/npm/v/@rineex/ddd)](https://www.npmjs.com/package/@rineex/ddd)
[![npm downloads](https://img.shields.io/npm/dm/@rineex/ddd)](https://www.npmjs.com/package/@rineex/ddd)

A comprehensive, production-grade TypeScript library providing battle-tested abstractions for implementing Domain-Driven Design patterns. Build maintainable, scalable applications with type-safe entities, aggregates, value objects, and domain events.

#### Quick Summary

- **Value Objects**: Immutable objects distinguished by value, not identity
- **Entities**: Objects with unique identity and lifecycle
- **Aggregate Roots**: Entry points to aggregates with invariant enforcement and event support
- **Domain Events**: Immutable records of significant domain occurrences
- **Application Services**: Orchestrators for use cases and commands
- **Zero Dependencies**: Lightweight with only peer dependencies

#### Key Features

✨ **Type-Safe Abstractions** - Fully typed base classes for all DDD building blocks  
🔒 **Immutability by Default** - Value objects and entities are frozen to prevent mutations  
📡 **Domain Events Support** - First-class support for event sourcing and event-driven architectures  
✅ **Built-in Validation** - Enforce domain rules at aggregate boundaries  
⚡ **Zero Dependencies** - Minimal bundle footprint for maximum flexibility  
🏢 **Production Ready** - Used in high-performance systems at scale

#### Quick Start

```bash
npm install @rineex/ddd
```

```typescript
import { AggregateRoot, ValueObject, AggregateId, DomainEvent } from '@rineex/ddd';

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

For in-depth guidance, examples, and best practices, see the [**@rineex/ddd Documentation**](./packages/ddd/README.md):

- 📚 [Core Concepts Guide](./packages/ddd/README.md#core-concepts) - Value Objects, Entities, Aggregates, Events
- 🔧 [Complete API Reference](./packages/ddd/README.md#api-reference) - All classes, interfaces, and methods
- 💡 [Real-World Examples](./packages/ddd/README.md#examples) - Full order management system implementation
- ✅ [Best Practices](./packages/ddd/README.md#best-practices) - FAANG-level patterns and principles
- 🚨 [Error Handling](./packages/ddd/README.md#error-handling) - Proper error management strategies
- 🤝 [Contributing Guide](./packages/ddd/README.md#contributing) - Development setup and guidelines

#### Included Value Objects

- `AggregateId` - Unique identifier for aggregates
- `IPAddress` - IPv4/IPv6 validation
- `URL` - Web URL validation
- `UserAgent` - User agent string parsing

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
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
├── scripts/                    # Build and utility scripts
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # PNPM workspace configuration
└── README.md
```

## Development

### Prerequisites

- **Node.js**: 18.0 or higher
- **pnpm**: 8.0 or higher (npm/yarn supported but not recommended)
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

The monorepo uses [Turborepo](https://turbo.build/) for efficient task execution across packages.

```bash
# Run command in all packages
pnpm turbo run build

# Run command in specific package
pnpm --filter @rineex/ddd build

# Watch mode for development
pnpm turbo run dev --parallel
```

## Publishing

Packages are published automatically through GitHub Actions when changes are merged to the main branch. Version management is handled via [Changesets](https://github.com/changesets/changesets).

### Creating a Changeset

```bash
pnpm changeset
```

Follow the prompts to document your changes. This will create a changeset file that will be used to automatically bump versions and generate changelogs.

## Architecture Principles

This monorepo follows these key principles:

1. **Domain-Driven Design** - Clear separation of domain logic from infrastructure
2. **Type Safety** - Strict TypeScript configuration for compile-time safety
3. **Immutability** - Default-immutable data structures to prevent bugs
4. **Composition** - Small, focused packages that can be used independently
5. **Zero Dependencies** - Minimal external dependencies for reliability
6. **Testing** - Comprehensive test coverage with Vitest

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

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

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation** - See individual package READMEs
- 🐛 **Issues** - Report bugs on [GitHub Issues](https://github.com/rineex/core/issues)
- 💬 **Discussions** - Ask questions on [GitHub Discussions](https://github.com/rineex/core/discussions)

## Related Resources

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.domainlanguage.com/ddd/) by Eric Evans
- [Implementing Domain-Driven Design](https://vaughnvernon.com/books/) by Vaughn Vernon
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Made with ❤️ by the Rineex Team**
