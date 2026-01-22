/**
 * Deeply freezes an object graph to enforce runtime immutability.
 * - Handles arrays
 * - Handles circular references
 * - Skips functions
 * - Skips already frozen objects
 *
 * Intended for aggregate and value object state only.
 */
export function deepFreeze<T>(
  value: T,
  seen = new WeakSet<object>(),
): Readonly<T> {
  // Primitives, null, undefined
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Functions should never be frozen
  if (typeof value === 'function') {
    return value;
  }

  // Avoid re-processing
  if (Object.isFrozen(value)) {
    return value as Readonly<T>;
  }

  // Handle circular references
  if (seen.has(value)) {
    return value as Readonly<T>;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item, seen);
    }
  } else {
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key], seen);
    }
  }

  return Object.freeze(value) as Readonly<T>;
}
