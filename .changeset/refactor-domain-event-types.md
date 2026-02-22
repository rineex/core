---
'@rineex/ddd': patch
---

Refactor DomainEvent serialization types.

- Moved `type-fest` from peerDependencies to devDependencies, as it is only
  needed for type definitions during build.
- Replaced the custom `Serializable` type definition with `JsonValue` from
  type-fest to standardize JSON serialization payloads.
- Removed unnecessary custom type definitions (`Primitive` and recursive
  `Serializable`), simplifying the code structure.
