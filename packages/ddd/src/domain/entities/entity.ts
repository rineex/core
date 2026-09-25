import { deepFreeze } from '@/utils';

import { DeepImmutable } from '../types/deep-immutable.type';
import { EntityId, EntityJson } from '../types';

export type Immutable<T> = DeepImmutable<T>;

/**
 * Configuration for the base Entity constructor.
 * Forces a single-object argument pattern to avoid positional argument errors.
 * @template ID - A type satisfying the EntityId interface.
 */
export interface EntityProps<ID extends EntityId, Props extends object> {
  /** The unique identity of the entity */
  readonly id: ID;
  /** Optional creation timestamp; defaults to 'now' if not provided */
  readonly createdAt?: Date;

  props: Props;
}

/**
 * Abstract Base Entity for Domain-Driven Design (DDD).
 * This class provides the standard contract for entity equality and identity.
 * It intentionally avoids "magic" property bags to ensure V8 engine optimization
 * and better IDE intellisense.
 * @template ID - The specific Identity Value Object type.
 */
export abstract class Entity<ID extends EntityId, Props extends object> {
  /** The immutable unique identifier for this entity */
  public readonly id: ID;

  /** The timestamp when this entity was first instantiated/created. */
  public get createdAt(): Date {
    return new Date(this.#createdAtMillis);
  }
  /**
   * Read-only view of entity state.
   * External code can never mutate internal state.
   */
  protected get props(): Immutable<Props> {
    return this.#props as Immutable<Props>;
  }

  #createdAtMillis: number;

  // protected props: Props;
  #props: Props;

  /**
   * Protected constructor to be called by subclasses.
   * @param params - Initial identity and metadata.
   */
  protected constructor(params: EntityProps<ID, Props>) {
    this.id = params.id;
    const createdAtMillis = (params.createdAt ?? new Date()).getTime();
    if (!Number.isFinite(createdAtMillis)) {
      throw new Error('Entity createdAt must be a valid date');
    }

    this.#createdAtMillis = createdAtMillis;
    this.#props = deepFreeze(params.props);
  }

  private static normalize(value: unknown): unknown {
    if (value == null) return value;

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => Entity.normalize(item));
    }

    if (typeof value === 'object') {
      if ('toJSON' in value && typeof value.toJSON === 'function') {
        return Entity.normalize(value.toJSON());
      }

      const obj = value as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(obj).map(([key, val]) => [key, Entity.normalize(val)]),
      );
    }

    return String(value);
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
   * Converts the entity to a plain JSON-safe object with primitive values.
   */
  public toJSON(): EntityJson<ID, Props> {
    return Entity.normalize({
      ...this.#props,
      createdAt: this.createdAt,
      id: this.id.value,
    }) as EntityJson<ID, Props>;
  }

  /**
   * Converts the Entity into a plain Javascript object.
   * Subclasses must implement this to explicitly control serialization,
   * @returns A plain object representation of the entity.
   */
  public abstract toObject(): Record<string, unknown>;

  /**
   * Validates the current state of the entity against domain invariants.
   * This method should be called after construction and any mutation.
   * @throws {Error} Should throw a specific DomainError if validation fails.
   */
  public validate(): void {
    this.validateProps(this.#props as Immutable<Props>);
  }

  protected mutate(updater: (current: Props) => Props): void {
    const previous = this.#props;
    const next = deepFreeze(updater(previous));

    try {
      this.validateProps(next as Immutable<Props>);
      this.#props = next;
    } catch (error) {
      this.#props = previous;
      throw error;
    }
  }

  protected abstract validateProps(props: Immutable<Props>): void;
}
