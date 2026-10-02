# DDD primitives

`@rineex/ddd` provides framework-independent building blocks for modeling a
domain. It does not prescribe a database, HTTP framework, message bus, or
dependency-injection container.

## Install

```bash
pnpm add @rineex/ddd
```

## Value objects

`PrimitiveValueObject<T>` represents one validated primitive. `ValueObject<T>`
represents validated structured data, deep-freezes its props, compares by
concrete class and value, and serializes through `toJSON()`. Both expose
`value`, `equals`, `toJSON`, and `toString`.

```ts
import { Email, PrimitiveValueObject } from '@rineex/ddd';

class OrderNumber extends PrimitiveValueObject<string> {
  static from(value: string) {
    return new OrderNumber(value);
  }

  protected validate(value: string): void {
    if (!/^ORD-\d+$/.test(value)) throw new Error('Invalid order number');
  }
}

const email = Email.fromString('Person@Example.com');
console.log(email.value); // person@example.com
console.log(OrderNumber.from('ORD-42').equals(OrderNumber.from('ORD-42'))); // true
```

Built-in value objects are `AggregateId`, `DomainID`, `Email`, `IPAddress`,
`Timestamp`, `Url`, and `UserAgent`.

- `DomainID.generate()` produces a UUID v7-backed ID; `fromString()` validates
  an existing ID.
- `AggregateId` is the general aggregate identifier.
- `Email.fromString()` lowercases and validates email input.
- `IPAddress.create()` accepts valid IPv4 or IPv6 input.
- `Timestamp` accepts non-negative integer Unix milliseconds and has `toDate()`.
- `Url.create()` validates a URL and exposes `href`.
- `UserAgent` accepts a raw string and parsed metadata; its metadata includes
  bot/mobile information.

Invalid built-in values throw a typed domain validation error. Validate raw
input at the boundary, then pass value objects through the domain instead of raw
strings.

## Entities and aggregates

`Entity<ID, Props>` compares identity, not properties. Its protected `props` are
deeply immutable. Subclasses implement `validateProps` and `toObject`; use
protected `mutate` for an invariant-checked state transition.

```ts
import { AggregateId, Entity, type Immutable } from '@rineex/ddd';

type CustomerProps = { name: string; active: boolean };

class Customer extends Entity<AggregateId, CustomerProps> {
  static create(name: string) {
    return new Customer({
      id: AggregateId.generate(),
      props: { name, active: true },
    });
  }

  deactivate() {
    this.mutate(current => ({ ...current, active: false }));
  }

  protected validateProps(props: Immutable<CustomerProps>) {
    if (!props.name.trim()) throw new Error('Customer name is required');
  }

  toObject() {
    return {
      id: this.id.value,
      name: this.props.name,
      active: this.props.active,
    };
  }
}
```

`AggregateRoot` extends `Entity` and records domain events. `recordEvent`
requires the event aggregate ID to equal the root's ID. `domainEvents` returns a
read-only copy; `pullDomainEvents()` returns and clears the pending event
buffer. Persist the aggregate and publish its pulled events through an
application-owned transaction boundary.

## Domain events

Extend `DomainEvent` for facts that occurred in the domain. Its constructor
validates ID, event name, schema version, timestamp, and a JSON-safe payload;
payloads are deeply frozen. `toPrimitives()` returns a transport-safe record.

```ts
import { AggregateId, DomainEvent } from '@rineex/ddd';

class CustomerCreated extends DomainEvent<AggregateId, { email: string }> {}

const event = new CustomerCreated({
  id: crypto.randomUUID(),
  eventName: 'customer.created',
  aggregateId: AggregateId.generate(),
  schemaVersion: 1,
  occurredAt: Date.now(),
  payload: { email: 'person@example.com' },
});
```

## Results and errors

Use exceptions for broken domain invariants and `Result` for expected
application outcomes.

```ts
import {
  Result,
  type Result as ResultType,
  type UseCaseError,
} from '@rineex/ddd';

type RegisterResult = ResultType<{ id: string }, UseCaseError>;

function respond(result: RegisterResult) {
  return Result.match(result, {
    ok: value => ({ status: 201, body: value }),
    err: error => ({ status: 400, body: error.toObject?.() ?? error }),
  });
}
```

`Result.ok`, `Result.err`, `Result.void`, `isOk`, `isErr`, `isResult`, `map`,
`mapError`, `flatMap`, and `match` are available. `AsyncResult<T, E>` is
`Promise<Result<T, E>>`.

Extend `DomainError` for a typed, machine-readable error. Its `code` follows
`NAMESPACE.ERROR_NAME`, metadata is immutable and limited to primitives, and
`toObject()` returns code/message/metadata. Use `InferErrorCodes` and an error
registry to derive valid codes. Core errors include internal, invalid-state,
invalid-value, and timeout cases.

## Application and infrastructure helpers

The package exports application-service and logger ports, a clock port, HTTP
status constants, deep immutable/entity/mapper types, and `deepFreeze`.

`BaseMapper` provides `toDomainList`, `toDTOList`, and `toPersistenceList`
around the abstract `toDomain`, `toDomainProps`, `toDTO`, and `toPersistence`
operations. Keep database models and framework DTOs outside domain entities; map
at the infrastructure boundary.
