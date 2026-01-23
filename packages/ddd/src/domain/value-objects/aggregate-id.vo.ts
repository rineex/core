import { UUID } from './id.vo';

/**
 * AggregateId represents a strongly-typed aggregate identifier.
 *
 * - Backed by UUID v4
 * - Immutable
 * - Comparable only to AggregateId
 */
export class AggregateId extends UUID {}
