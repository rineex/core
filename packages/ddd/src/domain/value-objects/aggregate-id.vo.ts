import { DomainID } from './domain-id.vo';

/**
 * AggregateId represents a strongly-typed aggregate identifier.
 *
 * - Backed by UUID v7
 * - Immutable
 * - Comparable only to AggregateId
 */
export class AggregateId extends DomainID {}
