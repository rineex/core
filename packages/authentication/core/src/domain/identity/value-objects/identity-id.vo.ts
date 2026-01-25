import { DomainID } from '@rineex/ddd';

/**
 * Represents the canonical identity identifier in the auth domain.
 *
 * This does NOT imply:
 * - user
 * - account
 * - profile
 *
 * It is intentionally abstract to support:
 * - enterprise SSO
 * - external IdPs
 * - service identities
 */
export class IdentityId extends DomainID {}
