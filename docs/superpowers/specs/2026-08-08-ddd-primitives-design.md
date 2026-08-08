# DDD Primitive Hardening Design

## Goal

Strengthen `packages/ddd` around entity invariants, aggregate boundaries,
domain-event correctness, and explicit mapper-based rehydration. This is an
intentional breaking change.

## Entity contract

`Entity` stores identity and state but does not invoke overridable validation
from its base constructor. Concrete types validate after `super(...)` through
their creation/rehydration factory. Validation accepts candidate props so
`mutate` can validate before committing the replacement. A failed mutation
leaves the previous valid state intact.

Entity metadata and state must not expose mutable internal `Date` instances.
Serialization remains explicit: `toObject()` is the domain-specific object
projection; `toJSON()` is the JSON-safe primitive projection.

## Aggregate-root contract

An aggregate root is the only public entry point for changes to its consistency
boundary. Child entities are not exposed for independent persistence. Event
recording is protected and verifies that the event aggregate ID equals the root
ID. Events are returned in insertion order and pulled atomically after
successful application work.

## Domain-event contract

Events are immutable facts. Event ID, stable event name, positive schema
version, aggregate ID, occurrence timestamp, and JSON-safe payload are required
at construction. The base class does not depend on Node-specific random-ID
generation. Event payload serialization returns a detached primitive structure.

## Rehydration

Mappers translate persistence data into value objects and invoke an explicit
rehydration factory. Rehydration restores state without emitting creation
events. Creation factories may emit creation events only after the new aggregate
is valid.

## Documentation

Update the package README with a quick start and links to
`packages/ddd/docs/DDD-GUIDE.md` and `packages/ddd/docs/MIGRATION.md`. The guide
explains where each primitive belongs, when to use it, and when not to use it.
Migration notes list the removed/changed APIs and before/after examples.

## Testing

Add tests for constructor validation safety, atomic failed mutations, immutable
metadata and payloads, aggregate/event identity matching, event metadata
validation, event ordering, and mapper rehydration without creation events. Run
package type tests, unit tests, lint, and build after migration.
