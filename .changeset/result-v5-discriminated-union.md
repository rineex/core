---
'@rineex/ddd': major
---

Replace `Result` class with a frozen discriminated union (`kind: 'ok' | 'err'`),
add combinators (`match`, `flatMap`, `map`, `mapError`), and introduce
`UseCaseError` seam.

**Breaking changes:**

- `Result.fail(e)` → `Result.err(e)`
- `result.isSuccess` / `isFailure` → `Result.isOk(result)` /
  `Result.isErr(result)` or `result.kind`
- `getValue()` / `getError()` → `result.value` / `result.error` after narrowing
- Removed `isSuccessResult()` / `isFailureResult()`
- `Result<T, E>` no longer defaults `E` to `DomainError`; declare per use case

Closes #61
