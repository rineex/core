import { Entity } from '../entities/entity';
import { DomainEvent } from '../events';
import { EntityId } from '../types';

/**
 * Base class for aggregate roots in DDD, encapsulating domain events and validation.
 *
 * Aggregate roots are entities that serve as entry points to aggregates. They:
 * - Enforce invariants across the aggregate
 * - Manage domain events
 * - Define transaction boundaries
 *
 * @template ID - The type of the aggregate's identity (must extend EntityId)
 * @template P - The type of the aggregate's properties
 *
 * @example
 * ```typescript
 * interface UserProps {
 *   email: string;
 *   isActive: boolean;
 * }
 *
 * // With default Event type (DomainEvent):
 * class User extends AggregateRoot<AggregateId, UserProps> {
 *   // Implementation...
 * }
 *
 * // With specific event type for stronger typing:
 * class User extends AggregateRoot<AggregateId, UserProps, UserDomainEvent> {
 *   // Implementation...
 * }
 * ```
 */
export abstract class AggregateRoot<
  ID extends EntityId,
  P,
  Event extends DomainEvent = DomainEvent,
> extends Entity<ID, P> {
  /**
   * Gets a read-only copy of the domain events.
   */
  get domainEvents(): readonly Event[] {
    return [...this._domainEvents];
  }

  /**
   * Internal list of domain events.
   */
  private readonly _domainEvents: Event[] = [];

  /**
   * Adds a domain event to the aggregate after validating invariants.
   * @param domainEvent The domain event to add.
   * @throws {EntityValidationError} If invariants are not met.
   */
  addEvent(domainEvent: Event): void {
    this._domainEvents.push(domainEvent);
  }

  public pullDomainEvents(): readonly Event[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
