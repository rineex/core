---
'@rineex/ddd': minor
---

Add optional Event generic to AggregateRoot for typed domain events

AggregateRoot now accepts an optional third type parameter
`Event extends DomainEvent` (defaults to `DomainEvent`). This allows aggregates
to expose strongly-typed `domainEvents`, `addEvent()`, and `pullDomainEvents()`
when using a union or base type of domain events, improving type safety without
breaking existing usage.
