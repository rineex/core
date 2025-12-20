import { AggregateId } from '../value-objects/aggregate-id.vo';
import { Entity } from '../entities/entity';
import { DomainEvent } from '../events';

/**
 * Interface for AggregateRoot to ensure type safety and extensibility.
 */
export interface AggregateRootInterface {
  readonly id: AggregateId;
  readonly domainEvents: readonly DomainEvent[];
  /**
   * Validates the aggregate's invariants.
   * @throws {EntityValidationError} If validation fails.
   */
  validate: () => void;
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
export abstract class AggregateRoot<EntityProps>
  extends Entity<EntityProps>
  implements AggregateRootInterface
{
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
    this.validate(); // Ensure invariants before adding events
    this._domainEvents.push(domainEvent);
  }

  public pullDomainEvents(): readonly DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  /**
   * Validates the entity's invariants.
   * @throws {EntityValidationError} If validation fails.
   */
  abstract validate(): void;
}
