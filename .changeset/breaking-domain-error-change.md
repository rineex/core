---
'@rineex/ddd': major
---

Breaking changes in `DomainError` class:
- Now extends native `Error` for correct functionality, affecting serialization and type checks.
- Removed custom message property; uses inherited message from `Error`.
- Constructor updated to call `super(message)` and set `this.name`.
- Added prototype chain restoration for proper `instanceof` behavior.
- Adjusted property order in `toObject()` method and marked `toString()` with `override`.
- Simplified JSDoc comments.