# @rineex/ddd

Domain-driven design primitives for TypeScript applications: value objects,
entities, aggregates, domain events, results, errors, ports, mappers, and
utility types.

```bash
pnpm add @rineex/ddd
```

Start with `ValueObject` or `PrimitiveValueObject` for validated values,
`Entity` / `AggregateRoot` for identity-bearing state, and `Result` for explicit
success or error outcomes. Built-in value objects include `Email`, `Url`,
`Timestamp`, `DomainID`, and `AggregateId`.

See the [DDD primitives guide](../../docs/ddd.md) for the export map.
