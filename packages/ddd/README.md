# @rineex/ddd

> Domain-Driven Design (DDD) primitives for building maintainable, scalable
> TypeScript applications.

[![npm version](https://img.shields.io/npm/v/@rineex/ddd)](https://www.npmjs.com/package/@rineex/ddd)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Package Exports](#package-exports)
  - [Value Objects](#value-objects)
- [Primitive Value Objects](#primitive-value-objects)
  - [Entities](#entities)
  - [Aggregate Roots](#aggregate-roots)
  - [Domain Events](#domain-events)
- [Domain Errors](#domain-errors)
- [Result Type](#result-type)
  - [Application Services](#application-services)
- [Ports & Utilities](#ports--utilities)
- [Integration Guide](#integration-guide)
- [API Reference](#api-reference)
- [License](#license)

---

## Overview

`@rineex/ddd` provides type-safe building blocks for implementing Domain-Driven
Design patterns. Used by `@rineex/auth-core` and other Rineex packages.

**Features:** Value Objects, Entities, Aggregate Roots, Domain Events, Domain
Errors (extensible namespaces), Result type, Application Service port, Clock
port, HTTP status constants.

For placement rules, aggregate design, event recording, mapper-based
rehydration, and testing guidance, see [the DDD guide](./docs/DDD-GUIDE.md). For
the breaking API migration, see [MIGRATION.md](./docs/MIGRATION.md).

---

## Installation

```bash
pnpm add @rineex/ddd
```

**Requirements:** Node.js 18+, TypeScript 5.0+, ES2020+ target

---

## Package Exports

```typescript
import {
  ValueObject,
  PrimitiveValueObject,
  Entity,
  AggregateRoot,
  DomainEvent,
  AggregateId,
  DomainID,
  Email,
  IPAddress,
  DomainError,
  InferErrorCodes,
  registryErrorCodes,
  CoreDomainErrorRegistry,
  BaseMapper,
  InvalidValueObjectError,
  EntityValidationError,
  InvalidValueError,
  InvalidStateError,
  InternalError,
  TimeoutError,
  ApplicationError,
  ApplicationServicePort,
  Result,
  ClockPort,
  EntityId,
  EntityProps,
  DomainEventPayload,
  CreateEventProps,
  UnixTimestampMillis,
  HttpStatus,
  HttpStatusMessage,
  deepFreeze,
} from '@rineex/ddd';
```

---

## Value Objects

Value objects are immutable and defined by attributes. Use `ValueObject<T>` for
composite structures. Props are deep-frozen in the constructor.

### Example (from `vo.spec.ts`)

```typescript
import { ValueObject, InvalidValueObjectError } from '@rineex/ddd';

class TestValueObject extends ValueObject<{ name: string; age: number }> {
  constructor(props: { name: string; age: number }) {
    super(props);
  }

  protected validate(props: { name: string; age: number }): void {
    if (!props.name?.trim()) {
      throw InvalidValueObjectError.create('Name is required');
    }
    if (props.age < 0 || props.age > 150) {
      throw InvalidValueObjectError.create('Age must be between 0 and 150');
    }
  }
}

// Usage
const vo = new TestValueObject({ name: 'John', age: 30 });
vo.value; // { name: 'John', age: 30 }
vo.equals(other); // deep equality
vo.toJSON(); // returns props
vo.toString(); // JSON.stringify(props)
ValueObject.is(vo); // type guard
```

### Simple Value Object (wraps a single value)

```typescript
class SimpleValueObject extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value?.length) {
      throw InvalidValueObjectError.create('Value cannot be empty');
    }
  }
}
```

---

## Primitive Value Objects

For single primitives (string, number, boolean), extend
`PrimitiveValueObject<T>`. Equality is by reference (`===`).

Use `PrimitiveValueObject` for any validated primitive domain concept. Only
string, number, and bigint wrappers are valid entity IDs; a boolean wrapper is
not an identity type.

### Example (from `primitive-vo.spec.ts`)

```typescript
import { PrimitiveValueObject, InvalidValueObjectError } from '@rineex/ddd';

class StringVO extends PrimitiveValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(value: string): void {
    if (!value?.length) {
      throw InvalidValueObjectError.create('String cannot be empty');
    }
  }
}

class NumberVO extends PrimitiveValueObject<number> {
  constructor(value: number) {
    super(value);
  }

  protected validate(value: number): void {
    if (value < 0) {
      throw InvalidValueObjectError.create('Number must be non-negative');
    }
  }
}

// Usage
const s = new StringVO('test');
s.value; // 'test'
s.getValue(); // deprecated, use .value
s.toString(); // 'test'
s.equals(new StringVO('test')); // true
```

### Pre-built: Email

```typescript
import { Email } from '@rineex/ddd';

const email = Email.fromString('user@example.com');
// or: new Email('user@example.com')
email.value; // 'user@example.com'
email.toString();
```

### Pre-built: IPAddress

```typescript
import { IPAddress } from '@rineex/ddd';

const ip = IPAddress.fromString('192.168.1.1');
ip.value; // '192.168.1.1'
```

### Pre-built: AggregateId & DomainID

```typescript
import { AggregateId, DomainID } from '@rineex/ddd';

// AggregateId
const id = AggregateId.generate();
const fromStr = AggregateId.fromString('550e8400-e29b-41d4-a716-446655440000');

// DomainID – extend for custom IDs
class AuthAttemptId extends DomainID {}

const attemptId = AuthAttemptId.generate();
const parsed = AuthAttemptId.fromString('550e8400-e29b-41d4-a716-446655440000');
```

---

## Entities

Entities have stable identity. Equality is by `id`, not attributes. Use
`mutate(updater)` for state changes; it re-freezes and re-validates. Use
`AggregateId` or extend `DomainID` for custom identity types.

### Example (from `@rineex/auth-core` OAuthAuthorization)

```typescript
import { Entity, EntityProps, DomainID } from '@rineex/ddd';

// Custom ID – extend DomainID for domain-specific identifiers
class OAuthAuthorizationId extends DomainID {}

export interface OAuthAuthorizationProps {
  provider: string;
  redirectUri: string;
  scope: readonly string[];
}

export class OAuthAuthorization extends Entity<
  OAuthAuthorizationId,
  OAuthAuthorizationProps
> {
  private constructor(
    props: EntityProps<OAuthAuthorizationId, OAuthAuthorizationProps>,
  ) {
    super({ ...props });
    this.validate();
  }

  static create(
    props: EntityProps<OAuthAuthorizationId, OAuthAuthorizationProps>,
  ): OAuthAuthorization {
    return new OAuthAuthorization(props);
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id.value,
      provider: this.props.provider,
      redirectUri: this.props.redirectUri,
      scope: this.props.scope,
    };
  }

  protected validateProps(props: OAuthAuthorizationProps): void {
    if (!props.redirectUri.startsWith('https://')) {
      throw new Error('Redirect URI must use HTTPS');
    }
  }
}

// Usage
const auth = OAuthAuthorization.create({
  id: OAuthAuthorizationId.generate(),
  props: {
    provider: 'google',
    redirectUri: 'https://app.example.com/callback',
    scope: ['openid', 'email'],
  },
});
auth.equals(other); // true iff same id
```

---

## Aggregate Roots

Aggregate roots extend `Entity` and add domain event support.

### Example (from `aggregate-root.spec.ts`)

```typescript
import {
  AggregateRoot,
  DomainEvent,
  AggregateId,
  EntityValidationError,
} from '@rineex/ddd';

interface OrderProps {
  customerId: string;
  total: number;
}

class OrderCreatedEvent extends DomainEvent<
  AggregateId,
  { customerId: string }
> {
  static create(props: {
    id: string;
    eventName: string;
    aggregateId: AggregateId;
    schemaVersion: number;
    occurredAt: number;
    payload: { customerId: string };
  }) {
    return new OrderCreatedEvent(props);
  }
}

class OrderCompletedEvent extends DomainEvent<AggregateId, { total: number }> {
  static create(props: {
    id: string;
    eventName: string;
    aggregateId: AggregateId;
    schemaVersion: number;
    occurredAt: number;
    payload: { total: number };
  }) {
    return new OrderCompletedEvent(props);
  }
}

class Order extends AggregateRoot<AggregateId, OrderProps> {
  constructor(params: {
    id: AggregateId;
    createdAt?: Date;
    props: OrderProps;
  }) {
    super(params);
    this.validate();
  }

  create(): void {
    this.recordEvent(
      OrderCreatedEvent.create({
        id: crypto.randomUUID(),
        eventName: 'OrderCreated',
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { customerId: this.props.customerId },
      }),
    );
  }

  complete(): void {
    this.recordEvent(
      OrderCompletedEvent.create({
        id: crypto.randomUUID(),
        eventName: 'OrderCompleted',
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { total: this.props.total },
      }),
    );
  }

  protected validateProps(props: OrderProps): void {
    if (!props.customerId?.trim()) {
      throw EntityValidationError.create('Customer ID is required', {});
    }
    if (props.total < 0) {
      throw EntityValidationError.create('Total must be non-negative', {});
    }
  }

  toObject() {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      customerId: this.props.customerId,
      total: this.props.total,
    };
  }
}

// Usage
const order = new Order({
  id: AggregateId.generate(),
  props: { customerId: 'customer-1', total: 100 },
});
order.create();
order.complete();

order.domainEvents; // readonly copy
const events = order.pullDomainEvents(); // returns and clears
```

---

## Domain Events

Events are immutable. Payload must be JSON-safe (primitives, arrays, and plain
objects). Event factories must provide an ID and stable event name to the base
constructor; the base class never generates IDs through a runtime-specific API.

### Example (from `domain.event.spec.ts`)

```typescript
import { DomainEvent, DomainEventPayload, AggregateId } from '@rineex/ddd';

interface TestPayload extends DomainEventPayload {
  userId: string;
  action: string;
}

class TestDomainEvent extends DomainEvent<AggregateId, TestPayload> {
  static create(props: {
    id: string;
    eventName: string;
    aggregateId: AggregateId;
    schemaVersion: number;
    occurredAt: number;
    payload: TestPayload;
  }) {
    return new TestDomainEvent(props);
  }
}

// Usage
const event = TestDomainEvent.create({
  id: crypto.randomUUID(),
  eventName: 'TestEvent',
  aggregateId: AggregateId.generate(),
  schemaVersion: 1,
  occurredAt: Date.now(),
  payload: { userId: 'user-1', action: 'login' },
});

event.id;
event.eventName;
event.aggregateId;
event.schemaVersion;
event.occurredAt;
event.payload;

event.toPrimitives();
// { id, eventName, aggregateId, schemaVersion, occurredAt, payload }
```

---

## Domain Errors

### Base DomainError

Extend `DomainError<Code, Meta>` with an explicit code literal and optional
primitive metadata. Register codes in a bounded-context registry const.

```typescript
import { DomainError, InferErrorCodes, Metadata } from '@rineex/ddd';

export const UserErrorRegistry = {
  USER: ['NOT_FOUND', 'INVALID_EMAIL'],
} as const;

export type UserDomainErrorCode = InferErrorCodes<typeof UserErrorRegistry>;

type Props = Metadata<{ identityId: string }>;

class IdentityDisabledError extends DomainError<'USER.NOT_FOUND', Props> {
  readonly code = 'USER.NOT_FOUND' as const;

  constructor(message: string, props: Props) {
    super(message, props);
  }
}
```

### Core error registry

`@rineex/ddd` ships `CoreDomainErrorRegistry` and `InferErrorCodes` for built-in
codes (`DOMAIN.*`, `CORE.*`, `SYSTEM.*`). Each bounded context defines its own
registry:

```typescript
import type { InferErrorCodes } from '@rineex/ddd';

export const MyModuleErrorRegistry = {
  MY_MODULE: ['NOT_FOUND', 'INVALID_INPUT'],
} as const;

export type MyModuleDomainErrorCode = InferErrorCodes<
  typeof MyModuleErrorRegistry
>;
```

Use `registryErrorCodes(registry)` in architecture tests to verify every error
class code is registered.

### Built-in Errors

| Error                     | Code                     | Use case                             |
| ------------------------- | ------------------------ | ------------------------------------ |
| `InvalidValueObjectError` | `DOMAIN.INVALID_VALUE`   | Value object validation failure      |
| `EntityValidationError`   | `CORE.VALIDATION_FAILED` | Entity/aggregate invariant violation |
| `InvalidValueError`       | `DOMAIN.INVALID_VALUE`   | Value constraint violation           |
| `InvalidStateError`       | `DOMAIN.INVALID_STATE`   | Invalid state for operation          |
| `InternalError`           | `CORE.INTERNAL_ERROR`    | Unexpected/programming errors        |
| `TimeoutError`            | `SYSTEM.TIMEOUT`         | Operation timeout                    |
| `ApplicationError`        | (extends `Error`)        | Application/HTTP layer errors        |

```typescript
// InvalidValueError – optional metadata
throw new InvalidValueError('Age cannot be negative');
throw new InvalidValueError('Validation failed', {
  field: 'age',
  min: 18,
  max: 100,
});

// InvalidStateError – no metadata
throw new InvalidStateError('Cannot cancel completed order');

// EntityValidationError – props required
throw EntityValidationError.create('Name is required', {});

// ApplicationError – structured params
class UserNotFoundError extends ApplicationError {
  constructor(userId: string) {
    super({
      message: `User ${userId} not found`,
      code: 'USER_NOT_FOUND',
      isOperational: true,
      metadata: { userId },
    });
  }
}
```

---

## Result Type

`Result<T, E extends UseCaseError>` models **application use-case outcomes** —
return expected failures instead of throwing. Domain entities and value objects
**throw** `DomainError` on invariant violations; application services return
`Result`.

`E` is a per-use-case error union (`ApplicationError`, `DomainError`, etc.) —
there is no `DomainError` default.

### Layer contract

| Layer                            | Mechanism                                  |
| -------------------------------- | ------------------------------------------ |
| Domain (entity, VO, aggregate)   | Throw on invariant violation               |
| Application (use case)           | Return `Result<O, E>` from service methods |
| Infrastructure (HTTP, messaging) | Unwrap `Result` at the boundary            |

`ApplicationServicePort` returns `Promise<O>` — it is a structural seam for
orchestration. Application services that model expected failures should return
`Result` from their own `execute` methods (or wrap the port call at the
composition root).

### Example

```typescript
import { Result, UseCaseError, InvalidValueError } from '@rineex/ddd';

// Creation
const ok = Result.ok(42);
const voidOk = Result.ok(); // Ok<void> for command use cases with no return value
const failed = Result.err(new InvalidValueError('Invalid'));

// Narrowing
if (Result.isOk(ok)) {
  const value = ok.value; // number
}
if (Result.isErr(failed)) {
  const error = failed.error; // InvalidValueError
}

// match
const message = Result.match(failed, {
  ok: v => `ok ${v}`,
  err: e => e.message,
});
```

### Validation + chaining

```typescript
function validateEmail(email: string): Result<string, InvalidValueError> {
  if (!email.includes('@')) {
    return Result.err(new InvalidValueError('Invalid email format'));
  }
  return Result.ok(email);
}

function createAccount(
  email: string,
): Result<{ email: string }, InvalidValueError> {
  return Result.flatMap(validateEmail(email), validated =>
    Result.ok({ email: validated }),
  );
}
```

### v4 → v5 migration

| v4                                 | v5                                             |
| ---------------------------------- | ---------------------------------------------- |
| `Result.fail(e)`                   | `Result.err(e)`                                |
| `result.isSuccess` / `isFailure`   | `Result.isOk(result)` / `Result.isErr(result)` |
| `result.getValue()` / `getError()` | `result.value` / `result.error` (after narrow) |

---

## Application Services

Use `ApplicationServicePort<I, O>` for use-case orchestration. The port
signature is `execute(args: I): Promise<O>` — it does not return `Result`.
Services that need explicit failure channels return `Result` from a dedicated
method or wrap domain outcomes at the caller.

```typescript
import { ApplicationServicePort, Result, InvalidValueError } from '@rineex/ddd';

interface CreateUserInput {
  name: string;
  email: string;
}

interface CreateUserOutput {
  id: string;
  name: string;
}

class CreateUserService implements ApplicationServicePort<
  CreateUserInput,
  CreateUserOutput
> {
  async execute(args: CreateUserInput): Promise<CreateUserOutput> {
    // validate, create entity, persist, publish events
    return { id: '...', name: args.name };
  }
}

// Command with no return value — use Result.ok()
async function deactivateUser(
  id: string,
): Promise<Result<void, InvalidValueError>> {
  if (!id) return Result.err(new InvalidValueError('ID required'));
  // ... persist
  return Result.ok();
}
```

---

## Ports & Utilities

### ClockPort

```typescript
import type { ClockPort } from '@rineex/ddd';

const clock: ClockPort = {
  now: () => new Date(),
};
```

### HttpStatus & HttpStatusMessage

```typescript
import { HttpStatus, HttpStatusMessage } from '@rineex/ddd';

HttpStatus.OK; // 200
HttpStatus.NOT_FOUND; // 404
HttpStatusMessage[404]; // 'Not Found'
```

### deepFreeze

```typescript
import { deepFreeze } from '@rineex/ddd';

const frozen = deepFreeze({ a: 1, nested: { b: 2 } });
```

---

## Integration Guide

1. **Add dependency:** `pnpm add @rineex/ddd`

2. **Define an error registry** per bounded context (see
   [Domain Errors](#domain-errors)).

3. **Custom IDs:** Extend `DomainID` and use `generate()` / `fromString()`.

4. **Use `mutate()`** for entity/aggregate state changes.

5. **Persist then publish:** Save aggregate, then call `pullDomainEvents()` and
   publish.

---

## Core Concepts

Value Objects, Entities, Aggregate Roots, and Domain Events are documented in
the sections above. Domain errors use registry-backed codes; application
outcomes use `Result`.

---

## Examples

See [Aggregate Roots](#aggregate-roots) (Order example) and
[Integration Guide](#integration-guide) for end-to-end patterns.

---

## Best Practices

- Extend `DomainID` for branded aggregate identifiers
- Use `mutate()` for entity state changes — never mutate `props` directly
- Throw `DomainError` in domain layer; return `Result` in application layer
- Register error codes in a bounded-context registry and verify with
  architecture tests
- Call `pullDomainEvents()` after persistence, then publish

---

## Error Handling

See [Domain Errors](#domain-errors) for `DomainError`, registries, and built-in
error classes.

---

## Contributing

Develop in `packages/ddd`. Run `pnpm test`, `pnpm lint`, and `pnpm check-types`
from the package directory. Add a changeset for publishable changes:
`pnpm changeset` from the monorepo root.

---

## API Reference

### ValueObject\<T\>

| Member               | Description              |
| -------------------- | ------------------------ |
| `value`              | Read-only props          |
| `equals(other)`      | Deep equality            |
| `toJSON()`           | Returns props            |
| `toString()`         | `JSON.stringify(props)`  |
| `ValueObject.is(vo)` | Type guard               |
| `validate(props)`    | Abstract, must implement |

### PrimitiveValueObject\<T\>

| Member            | Description           |
| ----------------- | --------------------- |
| `value`           | Primitive value       |
| `getValue()`      | Same (deprecated)     |
| `equals(other)`   | Reference equality    |
| `toString()`      | String representation |
| `validate(value)` | Abstract              |

### Entity\<ID, Props\>

`Props` must be an object describing the entity's state. Do not use a scalar,
array, or DTO as entity props.

| Member                 | Description                                   |
| ---------------------- | --------------------------------------------- |
| `id`                   | Identity                                      |
| `createdAt`            | Creation date                                 |
| `props`                | Read-only (protected)                         |
| `equals(other)`        | By `id`                                       |
| `mutate(updater)`      | Safe state change + revalidate                |
| `validateProps(props)` | Protected abstract candidate-state validation |
| `toObject()`           | Abstract                                      |

### AggregateRoot\<ID, Props\>

Extends `Entity`. Adds:

| Member               | Description                                   |
| -------------------- | --------------------------------------------- |
| `recordEvent(event)` | Protected; append event after ownership check |
| `domainEvents`       | Read-only copy                                |
| `pullDomainEvents()` | Return and clear                              |

### DomainEvent\<AggregateId, Payload\>

| Member           | Description         |
| ---------------- | ------------------- |
| `id`             | Event ID            |
| `aggregateId`    | Aggregate reference |
| `schemaVersion`  | Version             |
| `occurredAt`     | Unix ms             |
| `payload`        | Serializable data   |
| `eventName`      | Stable event name   |
| `toPrimitives()` | Plain object        |

### Result\<T, E extends UseCaseError\>

| Member                                         | Description                               |
| ---------------------------------------------- | ----------------------------------------- |
| `Result.ok()`                                  | Success with no value (`Ok<void>`)        |
| `Result.ok(value)`                             | Success (`{ kind: 'ok', value }`)         |
| `Result.err(error)`                            | Failure (`{ kind: 'err', error }`)        |
| `Result.isOk(r)` / `Result.isErr(r)`           | Type guards                               |
| `Result.match(r, { ok, err })`                 | Exhaustive fold                           |
| `Result.flatMap(r, fn)`                        | Chain use cases; forwards err             |
| `Result.map(r, fn)` / `Result.mapError(r, fn)` | Transform value or error                  |
| `UseCaseError`                                 | `{ code: string }` seam for error channel |

---

## License

Apache-2.0 – see [LICENSE](../../LICENSE).
