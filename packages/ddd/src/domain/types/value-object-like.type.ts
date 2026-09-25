import type { ImmutableBrand } from './immutable-brand.type';

/**
 * The primitive kinds an entity id may wrap.
 * Excludes `symbol` (not serializable) and `null | undefined` (ids must exist).
 */
export type EntityIdPrimitive = bigint | boolean | number | string;

/**
 * Shared runtime contract for every Value Object in the domain.
 * `Entity.normalize` uses the presence of `toJSON` to know it can stop
 * recursing into a VO and emit the primitive/payload it returns.
 */
export interface ValueObjectLike<T = unknown> extends ImmutableBrand {
  readonly value: T;
  equals: (other: ValueObjectLike<T>) => boolean;
  toString: () => string;
  toJSON: () => unknown;
}
