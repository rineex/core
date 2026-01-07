---
'@rineex/ddd': major
---

Added type guard methods `isSuccessResult()` and `isFailureResult()` to Result
class for improved TypeScript type narrowing. Updated Result class
documentation, comprehensive unit tests, and README with usage examples and best
practices.

**New Methods:**

- `Result.isSuccessResult(): this is Result<T, never>` - Type guard for success
  results
- `Result.isFailureResult(): this is Result<never, E>` - Type guard for failure
  results

**Breaking Changes:** None - these are additive changes that enhance type safety
without breaking existing code.
