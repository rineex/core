import { ImmutableBrand } from './immutable-brand.type';

type IsTuple<T extends readonly unknown[]> = number extends T['length']
  ? false
  : true;

/**
 * DeepImmutable<T>
 *
 * - Functions are preserved as-is.
 * - `Date` is preserved (note: `Date` is mutable; prefer a `Timestamp` VO).
 * - Types implementing `ImmutableBrand` (i.e. Value Objects) are preserved.
 * - `Promise<U>` becomes `Promise<DeepImmutable<U>>`.
 * - `Map`/`Set` become `ReadonlyMap`/`ReadonlySet` with deep-immutable args.
 * - Arrays become `readonly` arrays; tuples keep their shape.
 * - Everything else that is an object gets all properties `readonly`,
 *   recursively.
 */
export type DeepImmutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends Date
    ? T
    : T extends ImmutableBrand
      ? T
      : T extends Promise<infer U>
        ? Promise<DeepImmutable<U>>
        : T extends Map<infer K, infer V>
          ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
          : T extends Set<infer U>
            ? ReadonlySet<DeepImmutable<U>>
            : T extends readonly unknown[]
              ? IsTuple<T> extends true
                ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
                : readonly DeepImmutable<T[number]>[]
              : T extends object
                ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
                : T;
