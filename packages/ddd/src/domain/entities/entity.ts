import { ensureObject, UnwrapValueObject, unwrapValueObject } from '@/utils';

import { EntityValidationError } from '../errors/entity-validation.error';
import { AggregateId } from '../value-objects/aggregate-id.vo';

export interface EntityBaseInterface {
  id: AggregateId;
  equals: (entity: unknown) => boolean;
}

/**
 * Base properties common to all entities, including ID and timestamps.
 */
export interface BaseEntityProps {
  /** Unique identifier for the entity */
  id?: AggregateId;
  /** Date when the entity was created */
  createdAt: Date;
}

/**
 * Interface for constructing an entity with optional timestamps.
 * @template Props - The specific props type for the entity
 */
export type CreateEntityProps<T> = BaseEntityProps & {
  props: T;
};

/**
 * Abstract base class for domain entities in a Domain-Driven Design (DDD) context.
 * Provides common functionality for entity identification, equality comparison,
 * immutability, and validation. Entities extending this class must implement
 * the `validate` method to enforce domain invariants.
 * @template EntityProps - The specific props type for the entity
 */
export abstract class Entity<EntityProps> {
  /**
   * Returns the creation timestamp.
   * A new Date instance is returned to preserve immutability.
   *
   * @returns {Date} The creation date of the entity.
   */
  get createdAt(): Date {
    return new Date(this.#createdAt);
  }

  /**
   * Gets the entity's unique identifier.
   * @returns The entity's ID
   */
  get id(): AggregateId {
    return this.#id;
  }

  public get metadata() {
    return Object.freeze({
      createdAt: this.#createdAt.toISOString(),
      id: this.#id,
    });
  }

  /**
   * Returns an immutable shallow copy of the entity's properties.
   *
   * @returns {Readonly<EntityProps>} The entity domain properties.
   */
  get props(): Readonly<EntityProps> {
    return this.#props;
  }

  /** Private creation timestamp */
  #createdAt: Date;
  /** Private unique identifier for the entity */
  #id: AggregateId;
  /** Private entity-specific properties */
  #props: Readonly<EntityProps>;

  /**
   * Constructs an entity with the provided properties and timestamps.
   * Ensures immutability by cloning props and validates the entity.
   * @param params - Entity creation parameters
   * @throws EntityValidationError if the ID is empty or validation fails
   */
  protected constructor({
    createdAt,
    props,
    id,
  }: CreateEntityProps<EntityProps>) {
    if (!id) {
      throw new EntityValidationError('Entity ID cannot be empty');
    }

    this.#id = id ?? AggregateId.generate();
    this.#props = Object.freeze(props);
    const now = new Date();
    this.#createdAt = createdAt ? new Date(createdAt) : now;
  }

  /**
   * Checks if the provided value is an instance of Entity.
   * @param entity - The value to check
   * @returns True if the value is an Entity instance
   */
  static isEntity(entity: unknown): entity is EntityBaseInterface {
    return (
      typeof entity === 'object' &&
      entity !== null &&
      'id' in entity &&
      typeof (entity as any).equals === 'function'
    );
  }

  /**
   * Compares this entity with another to determine if they are the same.
   * Equality is based on the entity ID.
   * @param other - The entity to compare with
   * @returns True if the entities have the same ID
   */
  public equals(other?: Entity<EntityProps>): boolean {
    if (!other || !Entity.isEntity(other)) {
      return false;
    }

    return this.#id.equals(other.#id);
  }

  /**
   * Returns a frozen copy of the entity's properties, including base properties.
   * Ensures immutability by returning a new object.
   * @returns A frozen copy of the entity's properties
   */
  public getPropsCopy(): Readonly<EntityProps> {
    return Object.freeze(this.#props);
  }

  /**
   * Determines if the entity is transient, i.e., it has not been persisted yet.
   * By convention, an entity is considered transient if it lacks a valid identifier.
   * This can be useful when performing logic that depends on persistence state,
   * such as conditional inserts or validations that only apply to new entities.
   *
   * @returns True if the entity is transient (not persisted), otherwise false.
   */
  // public isPersisted(): boolean {
  //   return this.#id.isEmpty();
  // }

  public toJSON(): Record<string, unknown> {
    return this.toObject();
  }

  public toObject(): Readonly<
    UnwrapValueObject<EntityProps> & { createdAt: string; id: string }
  > {
    const props = unwrapValueObject(this.getPropsCopy());
    const safeProps = ensureObject(props);
    return Object.freeze({
      ...this.metadata,
      ...safeProps,
    }) as Readonly<
      UnwrapValueObject<EntityProps> & { createdAt: string; id: string }
    >;
  }

  /**
   * Validates the entity's state to enforce domain invariants.
   * Must be implemented by subclasses to define specific validation rules.
   * @throws EntityValidationError if validation fails
   */
  public abstract validate(): void;
}
