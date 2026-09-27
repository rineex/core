/**
 * Marker interface for entity instances.
 *
 * `DeepImmutable<T>` preserves entities as class instances. Their state is
 * already protected by `Entity`, and mapping them would erase private members
 * from their type.
 */
export interface EntityBrand {
  readonly __entityBrand: true;
}
