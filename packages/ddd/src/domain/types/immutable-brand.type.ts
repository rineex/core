/**
 * Marker interface for types that are immutable by construction.
 *
 * `DeepImmutable<T>` short-circuits when it encounters a type that
 * implements `ImmutableBrand` — it will not try to recurse into the
 * type's private fields or re-readonly its methods.
 *
 * Apply this to every Value Object base class.
 */
export interface ImmutableBrand {
  readonly __immutable: true;
}
