import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
  PrimitiveValueObject,
} from '@rineex/ddd';

type ExtraProps = {
  value: string;
};

type MetaProps = Metadata<ExtraProps>;

class InvalidMfaSessionIdViolation extends DomainError<MetaProps> {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.SESSION_ID_INVALID';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  static create(message: string, meta: MetaProps) {
    return new InvalidMfaSessionIdViolation(message, meta);
  }
}

export class MfaSessionId extends PrimitiveValueObject<string> {
  public static create(value: string): MfaSessionId {
    return new MfaSessionId(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidMfaSessionIdViolation.create('MFA session ID is invalid', {
        value,
      });
    }
  }
}
