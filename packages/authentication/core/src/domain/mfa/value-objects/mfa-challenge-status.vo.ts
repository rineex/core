import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
  PrimitiveValueObject,
} from '@rineex/ddd';

const AllowedStatuses = ['pending', 'verified', 'expired', 'failed'] as const;

type MfaChallengeStatusValue = (typeof AllowedStatuses)[number];

type MetaProps = {
  value: MfaChallengeStatusValue;
};

type Meta = Metadata<MetaProps>;

class InvalidMfaChallengeStatusViolation extends DomainError<Meta> {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.CHALLENGE_STATUS_INVALID';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  constructor(message: string, metadata: Meta) {
    super(message, { ...metadata });
  }

  static create(value: MfaChallengeStatusValue) {
    return new InvalidMfaChallengeStatusViolation(
      'MFA challenge status is invalid',
      { value },
    );
  }
}

export class MfaChallengeStatus extends PrimitiveValueObject<MfaChallengeStatusValue> {
  public static create(value: MfaChallengeStatusValue): MfaChallengeStatus {
    return new MfaChallengeStatus(value);
  }

  static pending() {
    return new MfaChallengeStatus('pending');
  }

  static verified() {
    return new MfaChallengeStatus('verified');
  }
  protected validate(value: MfaChallengeStatusValue): void {
    if (!AllowedStatuses.includes(value)) {
      throw InvalidMfaChallengeStatusViolation.create(value);
    }
  }
}
