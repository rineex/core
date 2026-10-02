# DDD primitives

`@rineex/ddd` supplies reusable TypeScript building blocks rather than a
persistence or application framework.

| Group                      | Exports                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Domain modeling            | `ValueObject`, `PrimitiveValueObject`, `Entity`, `AggregateRoot`, `DomainEvent`              |
| Value objects              | `AggregateId`, `DomainID`, `Email`, `IPAddress`, `Timestamp`, `Url`, `UserAgent`             |
| Result and errors          | `Result`, `DomainError`, error registry, internal/invalid-state/invalid-value/timeout errors |
| Types and utilities        | entity and mapper types, deep-primitive type, `deepFreeze`                                   |
| Application/infrastructure | application-service and logger ports, `BaseMapper`, HTTP status constants                    |

Value objects are the right boundary for validation and equality. Entities and
aggregates model identity-bearing state. Use `Result` when callers should handle
success or a typed error explicitly instead of relying on exceptions.
