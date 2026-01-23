import { PrimitiveValueObject } from '@rineex/ddd';

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
export class IdentityId extends PrimitiveValueObject<string> {
  public static create(value: string): IdentityId {
    return new IdentityId(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 8) {
      throw new Error('IdentityId must be a valid identifier');
    }
  }
}
