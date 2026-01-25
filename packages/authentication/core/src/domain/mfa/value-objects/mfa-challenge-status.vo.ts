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

/**
 * Raised when an MFA challenge status value is invalid.
 *
 * @remarks
 * This error is thrown when a status value does not match the allowed values:
 * 'pending', 'verified', 'expired', or 'failed'.
 */
class InvalidMfaChallengeStatusError extends DomainError<Meta> {
  readonly code: DomainErrorCode = 'AUTH_CORE_MFA.CHALLENGE_STATUS_INVALID';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  constructor(message: string, metadata: Meta) {
    super(message, { ...metadata });
  }

  static create(
    value: MfaChallengeStatusValue,
  ): InvalidMfaChallengeStatusError {
    return new InvalidMfaChallengeStatusError(
      'MFA challenge status is invalid',
      {
        value,
      },
    );
  }
}

/**
 * Represents the status of an MFA challenge.
 *
 * @remarks
 * Valid statuses are:
 * - 'pending': Challenge has been issued but not yet verified
 * - 'verified': Challenge has been successfully verified
 * - 'expired': Challenge has expired without being verified
 * - 'failed': Challenge verification failed
 *
 * @example
 * ```typescript
 * // Create a pending status
 * const status = MfaChallengeStatus.pending();
 *
 * // Create a verified status
 * const verifiedStatus = MfaChallengeStatus.verified();
 *
 * // Create from string value
 * const status = MfaChallengeStatus.create('pending');
 * ```
 */
export class MfaChallengeStatus extends PrimitiveValueObject<MfaChallengeStatusValue> {
  /**
   * Creates a new MFA challenge status from a string value.
   *
   * @param value - The status value ('pending', 'verified', 'expired', or 'failed')
   * @returns New MfaChallengeStatus instance
   * @throws {InvalidMfaChallengeStatusError} If the value is not a valid status
   */
  public static create(value: MfaChallengeStatusValue): MfaChallengeStatus {
    return new MfaChallengeStatus(value);
  }

  /**
   * Creates a status representing a pending challenge.
   *
   * @returns New MfaChallengeStatus with 'pending' value
   */
  static pending(): MfaChallengeStatus {
    return new MfaChallengeStatus('pending');
  }

  /**
   * Creates a status representing a verified challenge.
   *
   * @returns New MfaChallengeStatus with 'verified' value
   */
  static verified(): MfaChallengeStatus {
    return new MfaChallengeStatus('verified');
  }

  /**
   * Validates the status value.
   *
   * @param value - The status value to validate
   * @throws {InvalidMfaChallengeStatusError} If the value is not in the allowed list
   */
  protected validate(value: MfaChallengeStatusValue): void {
    if (!AllowedStatuses.includes(value)) {
      throw InvalidMfaChallengeStatusError.create(value);
    }
  }
}
