---
'@rineex/ddd': minor
---

Allow sync `ApplicationServicePort.execute` implementations and add
`resolveExecuteResult()` for call-site boundaries.

- `ApplicationServicePort.execute` return type widened from `Promise<O>` to
  `O | Promise<O>` (`ApplicationExecuteResult<O>`)
- New `resolveExecuteResult()` normalizes sync/async results via
  `Promise.resolve`
- Existing async services remain valid without changes
