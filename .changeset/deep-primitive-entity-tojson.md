---
'@rineex/ddd': minor
---

Add `DeepPrimitive<T>` and type-safe `Entity.toJSON()` return types.

- `DeepPrimitive<T>` recursively maps domain values to JSON-safe primitives
  (`Date` → ISO string, `EntityId` → `value`, `ValueObject` unwrap,
  arrays/objects)
- `EntityJson<ID, Props>` is the structural shape returned by `toJSON()`
- `Entity.toJSON()` is typed as `EntityJson<ID, Props>` instead of
  `Record<string, unknown>`
