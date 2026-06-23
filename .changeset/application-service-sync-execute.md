---
'@rineex/ddd': minor
---

Widen `ApplicationServicePort.execute` return type from `Promise<O>` to
`O | Promise<O>` so sync use cases avoid unnecessary Promise allocation.
