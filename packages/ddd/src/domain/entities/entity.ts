import { EntityId } from '../types';

/**
 * Configuration for the base Entity constructor.
 * Forces a single-object argument pattern to avoid positional argument errors.
 * @template ID - A type satisfying the EntityId interface.
 */
export interface EntityProps<ID extends EntityId, Props> {
  /** The unique identity of the entity */
  readonly id: ID;
  /** Optional creation timestamp; defaults to 'now' if not provided */
  readonly createdAt?: Date;

  readonly props: Props;
}

/**
 * Abstract Base Entity for Domain-Driven Design (DDD).
 * This class provides the standard contract for entity equality and identity.
 * It intentionally avoids "magic" property bags to ensure V8 engine optimization
 * and better IDE intellisense.
 * @template ID - The specific Identity Value Object type.
 */
export abstract class Entity<ID extends EntityId, Props> {
  /** The immutable unique identifier for this entity */
  public readonly id: ID;
  /** The timestamp when this entity was first instantiated/created */
  public readonly createdAt: Date;

  /**
   * Protected constructor to be called by subclasses.
   * @param props - Initial identity and metadata.
   */
  protected constructor(props: EntityProps<ID, Props>) {
    this.id = props.id;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Compares entities by identity.
   * In DDD, two entities are considered equal if their IDs match,
   * regardless of their other properties.
   * @param other - The entity to compare against.
   * @returns True if IDs are equal.
   */
  public equals(other?: Entity<ID, Props>): boolean {
    if (other == null) return false;
    if (this === other) return true;
    return this.id.equals(other.id);
  }

  /**
   * Validates the current state of the entity against domain invariants.
   * This method should be called after construction and any mutation.
   * @throws {Error} Should throw a specific DomainError if validation fails.
   */
  public abstract validate(): void;

  /**
   * Converts the Entity into a plain Javascript object.
   * Subclasses must implement this to explicitly control serialization,
   * @returns A plain object representation of the entity.
   */
  public abstract toObject(): Record<string, unknown>;
}
