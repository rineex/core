import { DomainViolation } from '@rineex/ddd';

/**
 * Base class for all authentication domain violations.
 *
 * Auth domain MUST only throw DomainViolation objects.
 * Mapping to native Error happens at application or adapter layer.
 */
export abstract class AuthDomainViolation extends DomainViolation {}
