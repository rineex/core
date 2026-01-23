import { DomainError } from '@rineex/ddd';

/**
 * Base class for all authentication domain violations.
 *
 * Auth domain MUST only throw DomainViolation objects.
 * Mapping to native Error happens at application or adapter layer.
 * @deprecated
 */
export abstract class AuthDomainViolation extends DomainError {}
