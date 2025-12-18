/**
 * Utility to deeply freeze objects to ensure immutability - handles nested objects and arrays.
 *
 * @param obj - The object to be deeply frozen.
 * @param seen - A WeakSet to track already processed objects (for circular references).
 * @returns A deeply frozen version of the input object.
 */
export function deepFreeze<T>(
  obj: T,
  seen = new WeakSet<object>(),
): Readonly<T> {
  // Handle null, undefined, or non-object types
  if (obj == null || (typeof obj !== 'object' && !Array.isArray(obj))) {
    return obj;
  }

  // Skip if already frozen
  if (Object.isFrozen(obj)) {
    return obj as Readonly<T>;
  }

  // Handle circular references
  if (seen.has(obj as object)) {
    return obj as Readonly<T>;
  }

  seen.add(obj as object);

  // Handle arrays explicitly
  if (Array.isArray(obj)) {
    obj.forEach(item => deepFreeze(item, seen));
  } else {
    // Handle plain objects
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        deepFreeze((obj as Record<string, unknown>)[key], seen);
      }
    }
  }

  return Object.freeze(obj) as Readonly<T>;
}
