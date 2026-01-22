import { Primitive } from 'type-fest';

/**
 * Interface for Identity Value Objects.
 * Enables the Entity to remain agnostic of the underlying ID implementation
 * (e.g., UUID, ULID, or Database Sequence).
 * @template T - The underlying primitive type of the ID (usually string or number).
 */

export interface EntityId {
  equals: <T extends EntityId>(other?: T) => boolean;
  toString: () => string;

  readonly value: Readonly<Primitive>;
}
