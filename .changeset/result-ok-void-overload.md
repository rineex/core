---
'@rineex/ddd': minor
---

Add `Result.ok()` void overload for command use cases that succeed without a
value.

- `Result.ok()` returns `Ok<void>`; `Result.ok(value)` returns `Ok<T>` as before
- `Ok<T>` and `Result<T, E>` default type parameters to `void` and
  `UseCaseError`
- `flatMap` widened to allow distinct error types in chained operations
