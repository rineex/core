# @rineex/ddd

> Domain-Driven Design (DDD) utilities and abstractions for building
> maintainable, scalable, and testable Node.js applications with clear
> separation of concerns.

[![npm version](https://img.shields.io/npm/v/@rineex/ddd)](https://www.npmjs.com/package/@rineex/ddd)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)

## Table of Contents

- [Overview](#overview)
- [Philosophy](#philosophy)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Value Objects](#value-objects)
  - [Entities](#entities)
  - [Aggregate Roots](#aggregate-roots)
  - [Domain Events](#domain-events)
  - [Application Services](#application-services)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Overview

`@rineex/ddd` is a lightweight TypeScript library that provides production-grade
abstractions for implementing Domain-Driven Design patterns. It enforces
architectural constraints that prevent common pitfalls in large-scale
applications while maintaining flexibility for domain-specific requirements.

### Key Features

- **Type-Safe Abstractions**: Fully typed base classes for all DDD building
  blocks
- **Immutability by Default**: Value objects and entities are frozen to prevent
  accidental mutations
- **Domain Events Support**: First-class support for event sourcing and
  event-driven architectures
- **Validation Framework**: Built-in validation for value objects and entities
- **Zero Dependencies**: Only peer dependencies, minimal bundle footprint
- **Production Ready**: Used in high-performance systems at scale
- **Comprehensive Error Types**: Specific error classes for domain-driven
  validation failures

## Philosophy

This library is built on core principles that enable teams to:

1. **Express Domain Logic Explicitly**: Make business rules clear and testable
2. **Enforce Invariants**: Validate state transitions at the boundary
3. **Manage Complexity**: Use aggregates to create transaction boundaries
4. **Enable Event-Driven Architectures**: Capture and publish domain events
5. **Maintain Testability**: Pure domain logic with no hidden dependencies

## Installation

```bash
npm install @rineex/ddd
# or
pnpm add @rineex/ddd
# or
yarn add @rineex/ddd
```

### Requirements

- **Node.js**: 18.0 or higher
- **TypeScript**: 5.0 or higher (recommended: 5.9+)
- **ES2020+**: Target the module to ES2020 or higher for optimal compatibility

## Quick Start

Here's a minimal example to get started:

```typescript
import {
  Entity,
  AggregateRoot,
  ValueObject,
  DomainEvent,
  ApplicationServicePort,
  AggregateId,
  type EntityProps,
} from '@rineex/ddd';

// Define a Value Object
class Email extends ValueObject<string> {
  public static create(value: string) {
    return new Email(value);
  }

  protected validate(props: string): void {
    if (!props.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}

// Define an Aggregate Root
interface UserProps {
  email: Email;
  isActive: boolean;
}

class User extends AggregateRoot<AggregateId, UserProps> {
  get email(): Email {
    return this.props.email;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  protected validate(): void {
    if (!this.email) {
      throw new Error('Email is required');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      email: this.email.value,
      isActive: this.isActive,
    };
  }
}

// Define a Domain Event
class UserCreatedEvent extends DomainEvent<AggregateId> {
  public readonly eventName = 'UserCreated';
}

// Create and use
const userId = AggregateId.generate();
const user = new User({
  id: userId,
  createdAt: new Date(),
  props: { email: Email.create('user@example.com'), isActive: true },
});

user.addEvent(
  new UserCreatedEvent({
    aggregateId: userId,
    schemaVersion: 1,
    occurredAt: Date.now(),
    payload: { email: user.email.value },
  }),
);

const events = user.pullDomainEvents();
console.log(events); // [UserCreatedEvent]
```

## Core Concepts

### Value Objects

Value Objects are immutable objects that are distinguished by their value rather
than their identity. They represent concepts within the domain that have no
lifecycle.

#### Characteristics

- **Immutable**: Cannot be changed after creation
- **Identity by Value**: Two value objects with the same properties are equal
- **Self-Validating**: Validation occurs during construction
- **No Side Effects**: Pure transformations only

#### Implementation

```typescript
import { ValueObject } from '@rineex/ddd';

interface AddressProps {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

class Address extends ValueObject<AddressProps> {
  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  public static create(props: AddressProps): Address {
    return new Address(props);
  }

  protected validate(props: AddressProps): void {
    if (!props.street || props.street.trim().length === 0) {
      throw new Error('Street is required');
    }
    if (!props.city || props.city.trim().length === 0) {
      throw new Error('City is required');
    }
    if (props.postalCode.length < 3) {
      throw new Error('Invalid postal code');
    }
  }
}

// Usage
const address = Address.create({
  street: '123 Main St',
  city: 'New York',
  postalCode: '10001',
  country: 'USA',
});

// Immutability guaranteed
// address.props.street = 'foo'; // Error: Cannot assign to read only property
```

#### Primitive Value Objects

For value objects that wrap a single primitive (string, number, or boolean), use
`PrimitiveValueObject` for better performance:

```typescript
import { PrimitiveValueObject } from '@rineex/ddd';

class Email extends PrimitiveValueObject<string> {
  public static create(value: string): Email {
    return new Email(value);
  }

  protected validate(value: string): void {
    if (!value.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}

// Usage
const email = Email.create('user@example.com');
console.log(email.getValue()); // 'user@example.com'
```

#### Type Safety with `unwrapValueObject`

When working with collections of value objects, use the `unwrapValueObject`
utility:

```typescript
import { unwrapValueObject, type UnwrapValueObject } from '@rineex/ddd';

interface UserProps {
  tags: Tag[]; // where Tag extends ValueObject<string>
}

const unwrapped: UnwrapValueObject<UserProps> = unwrapValueObject(userProps);
// { tags: ['admin', 'moderator'] }
```

### Entities

Entities are objects with a unique identity that persists over time. Unlike
value objects, they can be mutable and have a lifecycle.

#### Characteristics

- **Unique Identity**: Distinguished by a unique identifier (not just value)
- **Lifecycle**: Can be created, modified, and deleted
- **Mutable**: State can change, but identity remains constant
- **Equality by Identity**: Two entities with different properties but the same
  ID are equal

#### Implementation

```typescript
import { Entity, AggregateId, type EntityProps } from '@rineex/ddd';

interface OrderItemProps {
  productId: string;
  quantity: number;
  unitPrice: number;
}

class OrderItem extends Entity<AggregateId, OrderItemProps> {
  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get total(): number {
    return this.quantity * this.unitPrice;
  }

  protected validate(): void {
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    if (this.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      productId: this.productId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      total: this.total,
    };
  }
}

// Creating an entity
const item = new OrderItem({
  id: AggregateId.generate(),
  createdAt: new Date(),
  props: {
    productId: 'prod-123',
    quantity: 2,
    unitPrice: 29.99,
  },
});

console.log(item.total); // 59.98
```

### Aggregate Roots

Aggregate Roots are entities that serve as entry points to aggregates. They
enforce invariants, manage transactions, and raise domain events.

#### Characteristics

- **Boundary**: Define the scope of consistency within a transaction
- **Invariant Enforcement**: Validate rules that involve multiple entities or
  value objects
- **Event Publisher**: Raise domain events to notify other parts of the system
- **Transaction Consistency**: All changes within an aggregate should be
  persisted atomically

#### Implementation

```typescript
import {
  AggregateRoot,
  AggregateId,
  DomainEvent,
  type DomainEventPayload,
} from '@rineex/ddd';

// Define domain events
interface UserCreatedPayload extends DomainEventPayload {
  email: string;
}

class UserCreatedEvent extends DomainEvent<AggregateId, UserCreatedPayload> {
  public readonly eventName = 'UserCreated';
}

interface UserEmailChangedPayload extends DomainEventPayload {
  oldEmail: string;
  newEmail: string;
}

class UserEmailChangedEvent extends DomainEvent<
  AggregateId,
  UserEmailChangedPayload
> {
  public readonly eventName = 'UserEmailChanged';
}

// Define the aggregate
interface UserProps {
  email: string;
  isActive: boolean;
}

class User extends AggregateRoot<AggregateId, UserProps> {
  get email(): string {
    return this.props.email;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  public static create(email: string, id?: AggregateId): User {
    const userId = id || AggregateId.generate();
    const user = new User({
      id: userId,
      createdAt: new Date(),
      props: { email, isActive: true },
    });

    user.addEvent(
      new UserCreatedEvent({
        aggregateId: userId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { email },
      }),
    );

    return user;
  }

  public changeEmail(newEmail: string): void {
    // Validate before changing
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email format');
    }

    const oldEmail = this.props.email;
    this.props = { ...this.props, email: newEmail };

    this.addEvent(
      new UserEmailChangedEvent({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { oldEmail, newEmail },
      }),
    );
  }

  protected validate(): void {
    if (!this.props.email || !this.props.email.includes('@')) {
      throw new Error('User must have a valid email');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      email: this.email,
      isActive: this.isActive,
    };
  }
}

// Usage
const user = User.create('john@example.com');
user.changeEmail('jane@example.com');

const events = user.pullDomainEvents(); // Remove events for publishing
console.log(events); // [UserCreatedEvent, UserEmailChangedEvent]
```

#### Key Methods

- **`addEvent(event: DomainEvent): void`** - Adds a domain event after
  validating invariants
- **`pullDomainEvents(): readonly DomainEvent[]`** - Retrieves and clears all
  domain events
- **`validate(): void`** - Abstract method for enforcing aggregate invariants

### Domain Events

Domain Events represent significant things that happened in the domain. They are
immutable records of past events and enable event-driven architectures.

#### Characteristics

- **Immutable**: Represent facts that have already occurred
- **Self-Describing**: Include all necessary information in the payload
- **Serializable**: Can be persisted and transmitted
- **Versioned**: Schema version allows for evolution
- **Timestamped**: Record when the event occurred

#### Implementation

```typescript
import { DomainEvent, type DomainEventPayload, AggregateId } from '@rineex/ddd';

// Define event payloads (only primitives allowed)
interface OrderPlacedPayload extends DomainEventPayload {
  customerId: string;
  orderId: string;
  totalAmount: number;
  itemCount: number;
}

// Create event class
class OrderPlacedEvent extends DomainEvent<AggregateId, OrderPlacedPayload> {
  public readonly eventName = 'OrderPlaced';
}

// Using events
const orderId = AggregateId.generate();
const event = new OrderPlacedEvent({
  aggregateId: orderId,
  schemaVersion: 1,
  occurredAt: Date.now(),
  payload: {
    customerId: 'cust-456',
    orderId: orderId.toString(),
    totalAmount: 99.99,
    itemCount: 3,
  },
});

// Events are serializable
const primitives = event.toPrimitives();
// {
//   id: '...',
//   aggregateId: '...',
//   schemaVersion: 1,
//   occurredAt: 1234567890,
//   eventName: 'OrderPlaced',
//   payload: { customerId: '...', orderId: '...', ... }
// }
```

### Application Services

Application Services orchestrate the business logic of the domain. They are the
entry points for handling use cases and commands.

#### Characteristics

- **Use Case Implementation**: Each service handles a single, well-defined use
  case
- **Port Interface**: Implement a standard interface for consistency
- **Orchestration**: Coordinate domain objects, repositories, and external
  services
- **Transaction Management**: Define transaction boundaries
- **Error Handling**: Map domain errors to application-level responses

#### Implementation

```typescript
import type { ApplicationServicePort } from '@rineex/ddd';

// Define input and output DTOs
interface CreateUserInput {
  email: string;
  name: string;
}

interface CreateUserOutput {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Implement the service
class CreateUserService implements ApplicationServicePort<
  CreateUserInput,
  CreateUserOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(args: CreateUserInput): Promise<CreateUserOutput> {
    // Check for existing user
    const existing = await this.userRepository.findByEmail(args.email);
    if (existing) {
      throw new Error(`User with email ${args.email} already exists`);
    }

    // Create aggregate
    const user = User.create(args.email, args.name);

    // Persist
    await this.userRepository.save(user);

    // Publish events
    const events = user.pullDomainEvents();
    await this.eventPublisher.publishAll(events);

    return {
      id: user.id.uuid,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

// Using the service
const createUserService = new CreateUserService(userRepository, eventPublisher);
const result = await createUserService.execute({
  email: 'user@example.com',
  name: 'John Doe',
});
```

## API Reference

### Value Objects

#### `ValueObject<T>`

Abstract base class for all value objects.

```typescript
export abstract class ValueObject<T> {
  get value(): T;
  public static is(vo: unknown): vo is ValueObject<unknown>;
  public equals(other?: ValueObject<T>): boolean;
  protected abstract validate(props: T): void;
}
```

**Methods:**

- `value` - Returns the immutable properties
- `is(vo)` - Type guard for runtime checking
- `equals(other)` - Deep equality comparison
- `validate(props)` - Validation logic (must be implemented)

### Entities

#### `Entity<ID extends EntityId, Props>`

Abstract base class for domain entities.

```typescript
export abstract class Entity<ID extends EntityId, Props> {
  readonly id: ID;
  readonly createdAt: Date;
  abstract validate(): void;
  abstract toObject(): Record<string, unknown>;
  equals(other?: Entity<ID, Props>): boolean;
}
```

**Constructor:**

```typescript
new Entity({
  id: ID;                  // Required - must be an EntityId type
  createdAt?: Date;        // Optional - defaults to new Date()
  props: Props;            // Domain-specific properties
})
```

### Aggregate Roots

#### `AggregateRoot<ID extends EntityId, P>`

Extends `Entity` with domain event support.

```typescript
export abstract class AggregateRoot<ID extends EntityId, P> extends Entity<
  ID,
  P
> {
  readonly domainEvents: readonly DomainEvent[];
  abstract validate(): void;
  abstract toObject(): Record<string, unknown>;
  addEvent(event: DomainEvent): void;
  pullDomainEvents(): readonly DomainEvent[];
}
```

**Methods:**

- `addEvent(event)` - Add an event after validating invariants
- `pullDomainEvents()` - Get and clear all recorded events
- `domainEvents` - Read-only view of current events

### Domain Events

#### `DomainEvent<AggregateId extends EntityId, T extends DomainEventPayload>`

Abstract base class for domain events.

```typescript
export abstract class DomainEvent<
  AggregateId extends EntityId = EntityId,
  T extends DomainEventPayload = DomainEventPayload,
> {
  abstract readonly eventName: string;
  readonly id: string;
  readonly aggregateId: AggregateId;
  readonly schemaVersion: number;
  readonly occurredAt: number;
  readonly payload: Readonly<T>;

  toPrimitives(): {
    id: string;
    aggregateId: string;
    schemaVersion: number;
    occurredAt: number;
    eventName: string;
    payload: T;
  };
}
```

### Application Services

#### `ApplicationServicePort<I, O>`

Interface for application services.

```typescript
export interface ApplicationServicePort<I, O> {
  execute: (args: I) => Promise<O>;
}
```

### Value Objects (Pre-built)

#### `AggregateId`

Represents the unique identifier for an aggregate. Extends `UUID` which extends
`PrimitiveValueObject<string>`.

```typescript
class AggregateId extends UUID {
  public static generate(): AggregateId;
  public static fromString(value: string): AggregateId;
  public getValue(): string;
  public toString(): string;
}
```

#### `UUID`

Base class for UUID-based value objects.

```typescript
class UUID extends PrimitiveValueObject<string> {
  public static generate<T extends typeof UUID>(this: T): InstanceType<T>;
  public static fromString(value: string): UUID;
  public getValue(): string;
  public toString(): string;
}
```

#### `IPAddress`

Validates IPv4 and IPv6 addresses.

```typescript
class IPAddress extends ValueObject<string> {
  public static create(value: string): IPAddress;
  public get value(): string;
}
```

#### `Url`

Validates web URLs.

```typescript
class Url extends ValueObject<string> {
  public static create(value: string): Url;
  public get value(): string;
  public get href(): string;
}
```

#### `UserAgent`

Parses and validates user agent strings.

```typescript
class UserAgent extends ValueObject<string> {
  public static create(value: string): UserAgent;
  public get value(): string;
  public get isMobile(): boolean;
  public get isBot(): boolean;
  public getProps(): string;
}
```

### Error Types

#### `DomainError`

Base class for all domain errors.

```typescript
export class DomainError extends Error {
  constructor(message: string);
}
```

#### `EntityValidationError`

Thrown when entity validation fails.

```typescript
export class EntityValidationError extends DomainError {}
```

#### `InvalidValueObjectError`

Thrown when value object validation fails.

```typescript
export class InvalidValueObjectError extends DomainError {}
```

#### `ApplicationError`

Thrown for application-level errors with HTTP status codes.

```typescript
export abstract class ApplicationError extends Error {
  readonly code: HttpStatusMessage;
  readonly status: HttpStatusCode;
  readonly isOperational: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly cause?: Error;
}
```

### Result Type

#### `Result<T, E>`

Represents the outcome of an operation that can either succeed or fail, without
relying on exceptions for control flow.

```typescript
export class Result<T, E> {
  readonly isSuccess: boolean;
  readonly isFailure: boolean;

  public static ok<T, E>(value: T): Result<T, E>;
  public static fail<T, E>(error: E): Result<T, E>;
  public getValue(): T;
  public getError(): E;
}
```

**Example:**

```typescript
import { Result } from '@rineex/ddd';

function parseNumber(input: string): Result<number, string> {
  const value = Number(input);
  if (Number.isNaN(value)) {
    return Result.fail('Invalid number');
  }
  return Result.ok(value);
}

const result = parseNumber('42');
if (result.isSuccess) {
  console.log(result.getValue()); // 42
} else {
  console.error(result.getError());
}
```

### Domain Violations

#### `DomainViolation`

Base class for domain violations. Purposely does NOT extend native Error to
avoid stack trace overhead in the domain.

```typescript
export abstract class DomainViolation {
  abstract readonly code: string;
  abstract readonly message: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}
```

### HTTP Status Codes

#### `HttpStatus` and `HttpStatusMessage`

Typed HTTP status code constants and messages.

```typescript
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  // ... and many more
} as const;

export const HttpStatusMessage = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  // ... and many more
} as const;

export type HttpStatusCode = keyof typeof HttpStatusMessage;
export type HttpStatusMessage =
  (typeof HttpStatusMessage)[keyof typeof HttpStatusMessage];
```

### Utilities

#### `unwrapValueObject<T>`

Recursively unwraps value objects from nested structures.

```typescript
export function unwrapValueObject<T>(
  input: T,
  seen?: WeakSet<object>
): UnwrapValueObject<T>;

export type UnwrapValueObject<T> = /* recursive type utility */;
```

#### `deepFreeze<T>`

Deeply freezes objects to ensure immutability.

```typescript
export function deepFreeze<T>(obj: T, seen?: WeakSet<object>): Readonly<T>;
```

### Types

#### `EntityId<T>`

Interface for identity value objects.

```typescript
export interface EntityId<T = string> {
  equals(other?: EntityId<T> | null | undefined): boolean;
  toString(): string;
}
```

#### `EntityProps<ID extends EntityId, Props>`

Configuration for the base Entity constructor.

```typescript
export interface EntityProps<ID extends EntityId, Props> {
  readonly id: ID;
  readonly createdAt?: Date;
  readonly props: Props;
}
```

#### `DomainEventPayload`

Type for domain event payloads (only primitives and serializable structures).

```typescript
export type DomainEventPayload = Record<string, Serializable>;
```

## Examples

### Complete Order Management System

Here's a realistic example showing how to structure a domain with multiple
aggregates:

```typescript
import {
  AggregateRoot,
  AggregateId,
  ValueObject,
  DomainEvent,
  Entity,
  ApplicationServicePort,
  type DomainEventPayload,
} from '@rineex/ddd';

// ============ Value Objects ============

interface MoneyProps {
  amount: number;
  currency: string;
}

class Money extends ValueObject<MoneyProps> {
  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public static create(amount: number, currency = 'USD'): Money {
    return new Money({ amount, currency });
  }

  protected validate(props: MoneyProps): void {
    if (props.amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!props.currency || props.currency.length !== 3) {
      throw new Error('Invalid currency code');
    }
  }
}

// ============ Entities ============

interface OrderLineProps {
  productId: string;
  quantity: number;
  price: Money;
}

class OrderLine extends Entity<AggregateId, OrderLineProps> {
  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get price(): Money {
    return this.props.price;
  }

  get subtotal(): Money {
    return Money.create(this.price.amount * this.quantity, this.price.currency);
  }

  protected validate(): void {
    if (this.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      productId: this.productId,
      quantity: this.quantity,
      price: this.price.value,
    };
  }
}

// ============ Domain Events ============

interface OrderCreatedPayload extends DomainEventPayload {
  customerId: string;
}

class OrderCreatedEvent extends DomainEvent<AggregateId, OrderCreatedPayload> {
  public readonly eventName = 'OrderCreated';
}

interface OrderLineAddedPayload extends DomainEventPayload {
  productId: string;
  quantity: number;
}

class OrderLineAddedEvent extends DomainEvent<
  AggregateId,
  OrderLineAddedPayload
> {
  public readonly eventName = 'OrderLineAdded';
}

interface OrderCompletedPayload extends DomainEventPayload {
  total: number;
}

class OrderCompletedEvent extends DomainEvent<
  AggregateId,
  OrderCompletedPayload
> {
  public readonly eventName = 'OrderCompleted';
}

// ============ Aggregate Root ============

interface OrderProps {
  customerId: string;
  lines: OrderLine[];
  status: 'pending' | 'completed' | 'cancelled';
  total: Money;
}

class Order extends AggregateRoot<AggregateId, OrderProps> {
  get customerId(): string {
    return this.props.customerId;
  }

  get lines(): OrderLine[] {
    return this.props.lines;
  }

  get status(): string {
    return this.props.status;
  }

  get total(): Money {
    return this.props.total;
  }

  public static create(customerId: string, id?: AggregateId): Order {
    const orderId = id || AggregateId.generate();
    const order = new Order({
      id: orderId,
      createdAt: new Date(),
      props: {
        customerId,
        lines: [],
        status: 'pending',
        total: Money.create(0),
      },
    });

    order.addEvent(
      new OrderCreatedEvent({
        aggregateId: orderId,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { customerId },
      }),
    );

    return order;
  }

  public addLine(productId: string, quantity: number, price: Money): void {
    const line = new OrderLine({
      id: AggregateId.generate(),
      createdAt: new Date(),
      props: { productId, quantity, price },
    });

    this.props.lines.push(line);
    this.recalculateTotal();

    this.addEvent(
      new OrderLineAddedEvent({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { productId, quantity },
      }),
    );
  }

  public complete(): void {
    if (this.status !== 'pending') {
      throw new Error('Only pending orders can be completed');
    }

    this.props.status = 'completed';

    this.addEvent(
      new OrderCompletedEvent({
        aggregateId: this.id,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { total: this.total.amount },
      }),
    );
  }

  private recalculateTotal(): void {
    const sum = this.lines.reduce((acc, line) => acc + line.subtotal.amount, 0);
    this.props.total = Money.create(sum, 'USD');
  }

  protected validate(): void {
    if (!this.customerId) {
      throw new Error('Customer ID is required');
    }
    if (this.lines.length === 0) {
      throw new Error('Order must have at least one line');
    }
  }

  public toObject(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      createdAt: this.createdAt.toISOString(),
      customerId: this.customerId,
      lines: this.lines.map(line => line.toObject()),
      status: this.status,
      total: this.total.value,
    };
  }
}

// ============ Application Service ============

interface CreateOrderInput {
  customerId: string;
  lines: { productId: string; quantity: number; price: number }[];
}

interface CreateOrderOutput {
  id: string;
  customerId: string;
  total: number;
  lineCount: number;
}

class CreateOrderService implements ApplicationServicePort<
  CreateOrderInput,
  CreateOrderOutput
> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(args: CreateOrderInput): Promise<CreateOrderOutput> {
    const order = Order.create(args.customerId);

    for (const line of args.lines) {
      order.addLine(line.productId, line.quantity, Money.create(line.price));
    }

    order.complete();
    await this.orderRepository.save(order);

    return {
      id: order.id.toString(),
      customerId: order.customerId,
      total: order.total.amount,
      lineCount: order.lines.length,
    };
  }
}
```

## Best Practices

### 1. **Make Invalid States Impossible**

Use type system and validation to make invalid states impossible to construct:

```typescript
// ❌ BAD: Can create invalid state
class User {
  email: string;
  isVerified: boolean;
}

// ✅ GOOD: Invalid state impossible
class UnverifiedUser extends ValueObject<{ email: string }> {}
class VerifiedUser extends ValueObject<{ email: string; verifiedAt: Date }> {}
```

### 2. **Keep Aggregates Small**

Prefer small aggregates with clear boundaries over large aggregates with many
entities:

```typescript
// ❌ BAD: Too many entities in one aggregate
class Store extends AggregateRoot {
  employees: Employee[];
  inventory: InventoryItem[];
  orders: Order[];
  // ... many more
}

// ✅ GOOD: Separate aggregates with references
class Store extends AggregateRoot {
  name: string;
  // Reference to other aggregates by ID only
  employeeIds: AggregateId[];
}

class Inventory extends AggregateRoot {
  storeId: AggregateId;
  items: InventoryItem[];
}
```

### 3. **Use Value Objects for Primitive Types**

Wrap primitives that have domain meaning:

```typescript
// ❌ BAD: Raw primitive types
interface User {
  email: string;
  phone: string;
  age: number;
}

// ✅ GOOD: Domain-meaningful value objects
interface User {
  email: Email;
  phone: PhoneNumber;
  age: Age;
}
```

### 4. **Validate at Boundaries**

Perform all validation when creating aggregates, not repeatedly:

```typescript
// ❌ BAD: Repeated validation
function updateEmail(email: string) {
  if (!isValidEmail(email)) throw Error();
}

function sendEmail(email: string) {
  if (!isValidEmail(email)) throw Error();
}

// ✅ GOOD: Single validation point
const email = Email.create(value); // Throws if invalid
updateEmail(email);
sendEmail(email);
```

### 5. **Event-Driven State Changes**

All changes should be reflected in domain events:

```typescript
// ✅ GOOD: Changes recorded as events
class User extends AggregateRoot {
  changeEmail(newEmail: Email): void {
    const oldEmail = this.email;
    this.props.email = newEmail;

    this.addEvent(
      new EmailChangedEvent({
        id: crypto.randomUUID(),
        aggregateId: this.id.uuid,
        schemaVersion: 1,
        occurredAt: Date.now(),
        payload: { oldEmail: oldEmail.value, newEmail: newEmail.value },
      }),
    );
  }
}
```

### 6. **Publish Events After Persistence**

Always publish events after persisting the aggregate:

```typescript
async function handle(command: CreateUserCommand): Promise<void> {
  // Create aggregate
  const user = User.create(command.email);

  // Persist first
  await userRepository.save(user);

  // Then publish
  const events = user.pullDomainEvents();
  await eventPublisher.publishAll(events);
}
```

### 7. **Immutability by Convention**

Even though TypeScript doesn't enforce it, treat all domain objects as
immutable:

```typescript
// ✅ GOOD: Replace entire aggregate when state changes
class User extends AggregateRoot {
  changeName(newName: string): void {
    // Don't mutate: this.props.name = newName;

    // Instead, create new object:
    this.props = { ...this.props, name: newName };
  }
}
```

## Error Handling

Handle different error scenarios appropriately:

```typescript
import {
  DomainError,
  EntityValidationError,
  InvalidValueObjectError,
  ApplicationError,
  Result,
} from '@rineex/ddd';

// Using exceptions (traditional approach)
try {
  const email = Email.create('invalid-email');
} catch (error) {
  if (error instanceof InvalidValueObjectError) {
    // Handle value object validation errors
    console.error('Invalid email format:', error.message);
  }
}

try {
  const user = new User({
    id: AggregateId.generate(),
    createdAt: new Date(),
    props: { email: Email.create('user@example.com') },
  });
  user.validate();
} catch (error) {
  if (error instanceof EntityValidationError) {
    // Handle entity validation errors
    console.error('User invariant violated:', error.message);
  }
}

try {
  await userService.execute(input);
} catch (error) {
  if (error instanceof ApplicationError) {
    // Handle application-level errors
    console.error('Service failed:', error.message);
    console.error('HTTP Status:', error.status);
    console.error('Error Code:', error.code);
  } else if (error instanceof DomainError) {
    // Catch-all for domain errors
    console.error('Domain error:', error.message);
    console.error('Error Code:', error.code);
  }
}

// Using Result type (functional approach)
function createUser(email: string): Result<User, string> {
  try {
    const emailVO = Email.create(email);
    const user = new User({
      id: AggregateId.generate(),
      createdAt: new Date(),
      props: { email: emailVO, isActive: true },
    });
    return Result.ok(user);
  } catch (error) {
    return Result.fail(
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

const result = createUser('user@example.com');
if (result.isSuccess) {
  const user = result.getValue();
  // Use user
} else {
  const error = result.getError();
  // Handle error
}
```

## TypeScript Support

This library is built with TypeScript 5.9+ and provides comprehensive type
safety:

```typescript
// Full type inference
const user = User.create('user@example.com');
const id: AggregateId = user.id; // Correctly typed

// Type-safe event handling
const events = user.pullDomainEvents();
events.forEach(event => {
  if (event instanceof UserCreatedEvent) {
    // Type guard works correctly
    const payload = event.payload; // Correctly inferred type
  }
});

// Proper generic constraints
class MyAggregate extends AggregateRoot<MyProps> {
  // Full type safety with MyProps
}
```

### Recommended TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
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

### Code Style

- Follow the existing code style
- Use TypeScript strict mode
- Write descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## License

This project is licensed under the Apache License 2.0 - see the
[LICENSE](LICENSE) file for details.

## Related Resources

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.domainlanguage.com/ddd/)
  by Eric Evans
- [Implementing Domain-Driven Design](https://vaughnvernon.com/books/) by Vaughn
  Vernon
- [Architecture Patterns with Python](https://www.cosmicpython.com/) by Harry J.
  W. Percival and Bob Gregory
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues, questions, or suggestions, please open an issue on
[GitHub](https://github.com/rineex/core/issues).

---

**Made with ❤️ by the Rineex Team**
