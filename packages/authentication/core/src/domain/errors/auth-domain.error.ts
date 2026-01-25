import { DomainError } from '@rineex/ddd';

/**
 * Base class for all authentication domain errors.
 *
 * @remarks
 * This class is deprecated. Use DomainError directly instead.
 * Mapping to native Error happens at application or adapter layer.
 *
 * @deprecated Use DomainError directly instead
 */
export abstract class AuthDomainError extends DomainError {}
