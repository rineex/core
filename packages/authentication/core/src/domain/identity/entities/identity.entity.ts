import { Entity, EntityProps } from '@rineex/ddd';

import { IdentityId } from '../value-objects/identity-id.vo';

/**
 * Properties owned by the Identity entity.
 *
 * IMPORTANT:
 * - This is NOT a user profile
 * - This is NOT authorization data
 * - This represents a stable authentication identity
 *
 * Examples:
 * - Email-based identity
 * - External IdP subject
 * - Service or machine identity
 */
type IdentityProps = {
  readonly isActive: boolean;
};

/**
 * Identity entity.
 *
 * Represents "who is authenticating" in the system.
 *
 * This entity is intentionally minimal and stable.
 * Any additional concerns (profile, roles, permissions)
 * MUST live in other bounded contexts.
 */
export class Identity extends Entity<IdentityId, IdentityProps> {
  /**
   * Private constructor forces usage of factory methods.
   */
  private constructor(params: EntityProps<IdentityId, IdentityProps>) {
    super(params);
  }

  /**
   * Factory method to create a new identity.
   */
  static create(id: IdentityId, isActive: boolean = true): Identity {
    const identity = new Identity({ props: { isActive }, id });
    identity.validate();

    return identity;
  }

  /**
   * Disables this identity.
   */
  public disable(): void {
    if (!this.props.isActive) return;

    this.mutate(current => ({ ...current, isActive: false }));
  }

  /**
   * Enables this identity.
   */
  public enable(): void {
    if (this.props.isActive) return;

    this.mutate(current => ({ ...current, isActive: true }));
  }

  /**
   * Serialization to plain object.
   */
  public toObject(): Record<string, unknown> {
    return {
      createdAt: this.createdAt.toISOString(),
      isActive: this.props.isActive,
      id: this.id.toString(),
    };
  }

  /**
   * Domain invariant validation.
   */
  public validate(): void {
    if (this.id == null) {
      throw new Error('Identity must have a valid IdentityId');
    }
    if (typeof this.props.isActive !== 'boolean') {
      throw new Error('Identity.isActive must be a boolean');
    }
  }
}
