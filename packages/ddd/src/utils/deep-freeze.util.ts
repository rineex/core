/**
 * Determines whether a value can be frozen.
 */
function isFreezable(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Object.isFrozen(value);
}

/**
 * Deeply freezes an object graph to enforce runtime immutability.
 * - Handles arrays
 * - Handles circular references
 * - Skips functions
 * - Skips already frozen objects
 *
 * Intended for aggregate and value object state only.
 */
/**
 * Deeply freezes an object graph.
 *
 * Characteristics:
 * - Handles circular references
 * - Freezes Map and Set contents
 * - Freezes symbol properties
 * - Skips primitives
 *
 * Warning:
 * Expensive operation. Avoid in hot paths.
 */
export function deepFreeze<T>(
  value: T,
  seen = new WeakSet<object>(),
): Readonly<T> {
  if (!isFreezable(value)) {
    return value;
  }

  if (seen.has(value)) {
    return value as Readonly<T>;
  }

  seen.add(value);

  // Handle Map
  if (value instanceof Map) {
    for (const [k, v] of value.entries()) {
      deepFreeze(k, seen);
      deepFreeze(v, seen);
    }
  }

  // Handle Set
  else if (value instanceof Set) {
    for (const v of value.values()) {
      deepFreeze(v, seen);
    }
  }

  // Handle Array
  else if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item, seen);
    }
  }

  // Handle Object
  else {
    const keys = [
      ...Object.getOwnPropertyNames(value),
      ...Object.getOwnPropertySymbols(value),
    ];

    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor) continue;

      if ('value' in descriptor) {
        deepFreeze(descriptor.value, seen);
      }
    }
  }

  return Object.freeze(value);
}
