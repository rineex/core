import type {
  EntityIdPrimitive,
  ValueObjectLike,
} from './value-object-like.type';

/**
 * Contract every identity Value Object must satisfy.
 *
 * Keeps the `Entity` agnostic of the underlying ID implementation
 * (UUID, ULID, database sequence, …).
 */
export interface EntityId extends ValueObjectLike<EntityIdPrimitive> {
  readonly value: EntityIdPrimitive;
  equals: <T extends ValueObjectLike<EntityIdPrimitive>>(other?: T) => boolean;
  toJSON: () => EntityIdPrimitive;
}
