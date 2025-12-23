import { Entity } from '@rineex/ddd';

import { IdentityId } from '../value-objects/identity-id.vo';

/**
 * Represents an authenticated or authenticating identity.
 *
 * This entity is intentionally minimal.
 * All profile, permissions, and roles belong elsewhere.
 */
export class Identity extends Entity<IdentityId> {
  validate(): void {}
}
