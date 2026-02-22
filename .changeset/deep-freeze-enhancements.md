---
'@rineex/ddd': minor
---

### Enhancements to `deepFreeze` Utility

1. **New `isFreezable()` helper** – Extracted the check for whether a value can
   be frozen (object, non-null, not already frozen). Handles primitives, null,
   undefined, functions, and already-frozen objects.

2. **Map/Set support** – `deepFreeze` now recursively freezes Map keys and
   values, and Set elements.

3. **Symbol property support** – Utilizes `Object.getOwnPropertyNames` and
   `Object.getOwnPropertySymbols` to freeze symbol-keyed properties alongside
   string keys.

4. **Refactored structure** – Now organized as Map → Set → Array → Object
   branches, using `Object.getOwnPropertyDescriptor` and handling
   `descriptor.value` when present.

5. **Documentation updates** – JSDoc mentions circular references, Map/Set
   handling, symbol properties, and a performance warning about avoiding use in
   hot paths.
