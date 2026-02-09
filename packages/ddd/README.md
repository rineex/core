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
Design patterns. Used by `@rineex/authentication` and other Rineex packages.

**Features:** Value Objects, Entities, Aggregate Roots, Domain Events, Domain
Errors (extensible namespaces), Result type, Application Service port, Clock
port, HTTP status constants.

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
  DomainError,
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

### Example (from `@rineex/authentication` OAuthAuthorization)

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
  constructor(
    props: EntityProps<OAuthAuthorizationId, OAuthAuthorizationProps>,
  ) {
    super({ ...props });
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id.value,
      provider: this.props.provider,
      redirectUri: this.props.redirectUri,
      scope: this.props.scope,
    };
  }

  validate(): void {
    if (!this.props.redirectUri.startsWith('https://')) {
      throw new Error('Redirect URI must use HTTPS');
    }
  }
}

// Usage
const auth = new OAuthAuthorization({
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
  readonly eventName = 'OrderCreated';

  static create(props: {
    id?: string;
    aggregateId: AggregateId;
    schemaVersion: number;
    occurredAt: number;
    payload: { customerId: string };
  }) {
    return new OrderCreatedEvent(props);
  }
}

class OrderCompletedEvent extends DomainEvent<AggregateId, { total: number }> {
  readonly eventName = 'OrderCompleted';

  static create(props: {
    id?: string;
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
  }

  create(): void {
    this.addEvent(
      OrderCreatedEvent.create({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { customerId: this.props.customerId },
      }),
    );
  }

  complete(): void {
    this.addEvent(
      OrderCompletedEvent.create({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { total: this.props.total },
      }),
    );
  }

  validate(): void {
    if (!this.props.customerId?.trim()) {
      throw EntityValidationError.create('Customer ID is required', {});
    }
    if (this.props.total < 0) {
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

Events are immutable. Payload must be `Serializable` (primitives, arrays, plain
objects). `id` is auto-generated if omitted.

### Example (from `domain.event.spec.ts`)

```typescript
import { DomainEvent, DomainEventPayload, AggregateId } from '@rineex/ddd';

interface TestPayload extends DomainEventPayload {
  userId: string;
  action: string;
}

class TestDomainEvent extends DomainEvent<AggregateId, TestPayload> {
  readonly eventName = 'TestEvent';

  static create(props: {
    id?: string;
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

Extend `DomainError<Meta, Code>` with `code`, `type`, and constructor
`super(message, metadata)`.

```typescript
import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type Props = Metadata<{ identityId: string }>;

class IdentityDisabledError extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_IDENTITY.DISABLED_ERROR';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  private constructor(message: string, props: Props) {
    super(message, props);
  }

  static create(message: string, props: Props) {
    return new IdentityDisabledError(message, props);
  }
}
```

### Extending Error Namespaces

Declare namespaces via module augmentation for type-safe codes:

```typescript
// your-module.d.ts
import '@rineex/ddd';

declare module '@rineex/ddd' {
  interface DomainErrorNamespaces {
    USER: ['NOT_FOUND', 'INVALID_EMAIL'];
    ORDER: ['NOT_FOUND', 'INVALID_STATUS'];
  }
}
```

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

`Result<T, E>` for explicit success/failure without throwing. Default error type
is `DomainError`.

### Example (from `result.spec.ts`)

```typescript
import {
  Result,
  InvalidValueError,
  InvalidStateError,
  DomainError,
} from '@rineex/ddd';

// Creation
const ok = Result.ok(42);
const fail = Result.fail(new InvalidValueError('Invalid'));

// Checks
ok.isSuccess; // true
fail.isFailure; // true

// Extraction
ok.getValue(); // 42
fail.getError(); // InvalidValueError

// Type guards
if (result.isSuccessResult()) {
  const v = result.getValue(); // T
}
if (result.isFailureResult()) {
  const e = result.getError(); // E
}
```

### Validation pattern

```typescript
function validateAge(age: number): Result<number, DomainError> {
  if (age < 0) {
    return Result.fail(new InvalidValueError('Age cannot be negative'));
  }
  if (age > 150) {
    return Result.fail(new InvalidValueError('Age seems unrealistic'));
  }
  return Result.ok(age);
}
```

### Chaining

```typescript
function validateEmail(email: string): Result<string, DomainError> {
  if (!email.includes('@')) {
    return Result.fail(new InvalidValueError('Invalid email format'));
  }
  return Result.ok(email);
}

function createAccount(email: string): Result<{ email: string }, DomainError> {
  const emailResult = validateEmail(email);
  if (emailResult.isFailureResult()) return emailResult;

  const validated = emailResult.getValue()!;
  return Result.ok({ email: validated });
}
```

---

## Application Services

Use `ApplicationServicePort<I, O>` for use-case orchestration.

```typescript
import { ApplicationServicePort, Result } from '@rineex/ddd';

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

2. **Extend `DomainErrorNamespaces`** in a `.d.ts` file:

```typescript
declare module '@rineex/ddd' {
  interface DomainErrorNamespaces {
    MY_MODULE: ['NOT_FOUND', 'INVALID_INPUT'];
  }
}
```

3. **Custom IDs:** Extend `DomainID` and use `generate()` / `fromString()`.

4. **Use `mutate()`** for entity/aggregate state changes.

5. **Persist then publish:** Save aggregate, then call `pullDomainEvents()` and
   publish.

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

| Member            | Description                    |
| ----------------- | ------------------------------ |
| `id`              | Identity                       |
| `createdAt`       | Creation date                  |
| `props`           | Read-only (protected)          |
| `equals(other)`   | By `id`                        |
| `mutate(updater)` | Safe state change + revalidate |
| `validate()`      | Abstract                       |
| `toObject()`      | Abstract                       |

### AggregateRoot\<ID, Props\>

Extends `Entity`. Adds:

| Member               | Description         |
| -------------------- | ------------------- |
| `addEvent(event)`    | Append domain event |
| `domainEvents`       | Read-only copy      |
| `pullDomainEvents()` | Return and clear    |

### DomainEvent\<AggregateId, Payload\>

| Member           | Description         |
| ---------------- | ------------------- |
| `id`             | Event ID            |
| `aggregateId`    | Aggregate reference |
| `schemaVersion`  | Version             |
| `occurredAt`     | Unix ms             |
| `payload`        | Serializable data   |
| `eventName`      | Abstract            |
| `toPrimitives()` | Plain object        |

### Result\<T, E\>

| Member                                   | Description    |
| ---------------------------------------- | -------------- |
| `Result.ok(value)`                       | Success        |
| `Result.fail(err)`                       | Failure        |
| `isSuccess`, `isFailure`                 | Booleans       |
| `getValue()`, `getError()`               | Value or error |
| `isSuccessResult()`, `isFailureResult()` | Type guards    |

---

## License

Apache-2.0 – see [LICENSE](../../LICENSE).
