import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

export type IdentityStatusType = 'active' | 'disabled';

/**
 * Represents the lifecycle status of an Identity.
 */
export class IdentityStatus extends PrimitiveValueObject<IdentityStatusType> {
  public static Active(): IdentityStatus {
    return new IdentityStatus('active');
  }

  public static Disabled(): IdentityStatus {
    return new IdentityStatus('disabled');
  }

  public isActive(): boolean {
    return this.value === 'active';
  }

  protected validate(value: IdentityStatusType): void {
    if (!['active', 'disabled'].includes(value)) {
      throw InvalidValueObjectError.create(`Invalid IdentityStatus: ${value}`);
    }
  }
}
