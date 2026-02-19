/**
 * DeepImmutable<T> recursively marks T as immutable.
 * - Preserves class instances
 * - Converts Array, Map, Set to readonly
 * - Preserves functions and Date
 * - Preserves Promise types
 */
export type DeepImmutable<T> =
  // Functions are preserved
  T extends (...args: any[]) => any
    ? T
    : // Date is preserved
      T extends Date
      ? T
      : // Promise: deep readonly of the resolved type
        T extends Promise<infer U>
        ? Promise<DeepImmutable<U>>
        : // Map: converted to ReadonlyMap with deep immutable keys & values
          T extends Map<infer K, infer V>
          ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
          : // Set: converted to ReadonlySet with deep immutable elements
            T extends Set<infer U>
            ? ReadonlySet<DeepImmutable<U>>
            : // Array: converted to readonly array with deep immutable elements
              T extends (infer U)[]
              ? readonly DeepImmutable<U>[]
              : // Plain objects (not class instances) are recursively made readonly
                T extends object
                ? T extends { constructor: Function }
                  ? T // Preserve class instances
                  : { readonly [K in keyof T]: DeepImmutable<T[K]> }
                : T; // primitives remain as-is
