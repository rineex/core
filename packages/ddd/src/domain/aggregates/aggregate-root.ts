import { Entity, EntityProps } from '../entities/entity';
import { DomainEvent } from '../events';
import { EntityId } from '../types';

/**
 * Interface for AggregateRoot to ensure type safety and extensibility.
 */
export interface Props<P> extends EntityProps<EntityId, P> {
  readonly domainEvents: readonly DomainEvent[];
  /**
   * Adds a domain event to the aggregate.
   * @param event The domain event to add.
   */
  addEvent: (event: DomainEvent) => void;

  /**
   * Retrieves and clears all domain events recorded by this aggregate.
   *
   * Domain events represent facts that occurred as a result of state changes
   * within the aggregate. This method transfers ownership of those events
   * to the application layer for further processing (e.g. publishing).
   *
   * Calling this method has the side effect of clearing the aggregate's
   * internal event collection to prevent duplicate handling.
   *
   * This method is intended to be invoked by application services
   * after the aggregate has been successfully persisted.
   *
   * @returns A read-only list of domain events raised by this aggregate.
   */
  pullDomainEvents: () => readonly DomainEvent[];
}

/**
 * Base class for aggregate roots in DDD, encapsulating domain events and validation.
 * @template EntityProps The type of the entity's properties.
 */
export abstract class AggregateRoot<ID extends EntityId, P> extends Entity<
  ID,
  P
> {
  /**
   * Gets a read-only copy of the domain events.
   */
  get domainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Internal list of domain events.
   */
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * Adds a domain event to the aggregate after validating invariants.
   * @param domainEvent The domain event to add.
   * @throws {EntityValidationError} If invariants are not met.
   */
  addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public pullDomainEvents(): readonly DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
