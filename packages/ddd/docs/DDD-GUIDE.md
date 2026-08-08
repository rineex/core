# DDD Guide for `@rineex/ddd`

This package supplies tactical DDD building blocks. It does not decide your
bounded contexts, aggregate boundaries, or business language. Those decisions
belong to the application domain.

## Where code belongs

| Concern                                                                 | Location          |
| ----------------------------------------------------------------------- | ----------------- |
| Business rules, entities, value objects, aggregate roots, domain events | `domain/`         |
| Use-case orchestration and transaction ports                            | `application/`    |
| Database, ORM, HTTP, broker, and mapper implementations                 | `infrastructure/` |

Dependencies point inward: infrastructure depends on application and domain;
domain depends on neither.

## Entity

Use `Entity` when an object has identity and behavior but is not the aggregate's
transaction boundary. Keep state protected and expose methods that express
business intent.

```ts
class Account extends Entity<AccountId, AccountProps> {
  private constructor(params: EntityProps<AccountId, AccountProps>) {
    super(params);
    this.validate();
  }

  static create(props: AccountProps): Account {
    return new Account({ id: AccountId.generate(), props });
  }

  rename(name: string): void {
    this.mutate(current => ({ ...current, name }));
  }
}
```

Do not use an entity as a DTO, persistence row, or place for infrastructure
calls.

## Aggregate root

Use `AggregateRoot` when all changes to a consistency boundary must pass through
one object. Application services load and save the root; they do not update
child entities directly.

An aggregate command should validate its business preconditions, mutate state
atomically, and then record a past-tense event. Cross-aggregate coordination
belongs in the application layer and is normally eventually consistent.

## Value objects

Use value objects for concepts defined by their values: email addresses, IDs,
URLs, money, status, and similar concepts. Prefer them over primitive strings or
numbers when validation or domain meaning matters.

## Domain events

Events describe facts that already happened. Use stable past-tense names such as
`AccountOpened`. Include a versioned JSON-safe payload. The aggregate records
the event; an application handler or outbox adapter publishes it.

Do not put database writes, HTTP calls, event-bus calls, or command behavior in
an event class.

## Mappers and rehydration

Mappers are infrastructure adapters. They convert persistence primitives into
value objects and call the aggregate's explicit rehydration path. Rehydration
must restore state without emitting creation events.

```ts
toDomain(row: AccountRow): Account {
  return Account.rehydrate({
    id: AccountId.fromString(row.id),
    props: { name: row.name, status: AccountStatus.fromString(row.status) },
    createdAt: row.createdAt,
  });
}
```

## Testing checklist

- valid creation and invalid construction;
- every public command's successful transition;
- failed transitions leave state unchanged;
- aggregate event type, ID, payload, and order;
- rehydration emits no creation event;
- serialization contains primitives and no infrastructure objects.
