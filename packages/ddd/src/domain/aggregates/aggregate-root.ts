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
 * class User extends AggregateRoot<AggregateId, UserProps> {
 *   // Implementation...
 * }
 * ```
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
