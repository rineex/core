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

type P = Metadata<ExtraProps>;
class InvalidMfaChallengeIdViolation extends DomainError<P> {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.CHALLENGE_ID_INVALID';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  static create(msg: string, props: Metadata<P>) {
    return new InvalidMfaChallengeIdViolation(msg, props);
  }
}

export class MfaChallengeId extends PrimitiveValueObject<string> {
  public static create(value: string): MfaChallengeId {
    return new MfaChallengeId(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidMfaChallengeIdViolation.create(
        'MFA challenge ID is invalid',
        { value },
      );
    }
  }
}
