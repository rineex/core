import { DomainError, DomainErrorCode, DomainErrorType } from '@rineex/ddd';

/**
 * Base class for all passwordless challenge domain errors.
 *
 * @remarks
 * This abstract class provides a common foundation for passwordless challenge-related errors.
 * All specific passwordless challenge errors should extend this class.
 */
export abstract class PasswordlessChallengeError extends DomainError {
  abstract readonly code: DomainErrorCode;
  abstract readonly type: DomainErrorType;
}

/**
 * Raised when a passwordless challenge has expired.
 *
 * @remarks
 * This error is thrown when attempting to use a passwordless challenge that has passed
 * its expiration time. Challenges have a limited validity window for security purposes.
 *
 * @example
 * ```typescript
 * // Thrown when challenge is expired
 * if (challenge.isExpired(now)) {
 *   throw PasswordlessChallengeExpired.create();
 * }
 * ```
 */
export class PasswordlessChallengeExpiredError extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.CHALLENGE_EXPIRED';
  readonly message = 'Passwordless challenge has expired';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new PasswordlessChallengeExpired instance.
   *
   * @returns New PasswordlessChallengeExpired instance
   */
  static create(): PasswordlessChallengeExpiredError {
    return new PasswordlessChallengeExpiredError(
      'Passwordless challenge has expired',
      {},
    );
  }
}

/**
 * Raised when a passwordless challenge has already been used.
 *
 * @remarks
 * This error is thrown when attempting to use a passwordless challenge that
 * has already been consumed. Challenges are single-use only for security purposes.
 *
 * @example
 * ```typescript
 * // Thrown when challenge is already used
 * if (challenge.status.isUsed()) {
 *   throw PasswordlessChallengeAlreadyUsedErr.create();
 * }
 * ```
 */
export class PasswordlessChallengeAlreadyUsedError extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.CHALLENGE_ALREADY_USED';
  readonly message = 'Passwordless challenge has already been used';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new PasswordlessChallengeAlreadyUsedErr instance.
   *
   * @returns New PasswordlessChallengeAlreadyUsedErr instance
   */
  static create(): PasswordlessChallengeAlreadyUsedError {
    return new PasswordlessChallengeAlreadyUsedError(
      'Passwordless challenge has already been used',
      {},
    );
  }
}

/**
 * Raised when the provided secret does not match the challenge secret.
 *
 * @remarks
 * This error is thrown when attempting to verify a passwordless challenge with
 * an incorrect secret. The secret must match exactly for verification to succeed.
 *
 * @example
 * ```typescript
 * // Thrown when secret doesn't match
 * if (!challenge.matchesSecret(providedSecret)) {
 *   throw PasswordlessChallengeSecretMismatch.create();
 * }
 * ```
 */
export class PasswordlessChallengeSecretMismatchError extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.SECRET_MISMATCH';
  readonly message = 'Passwordless challenge secret does not match';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new PasswordlessChallengeSecretMismatch instance.
   *
   * @returns New PasswordlessChallengeSecretMismatch instance
   */
  static create(): PasswordlessChallengeSecretMismatchError {
    return new PasswordlessChallengeSecretMismatchError(
      'Passwordless challenge secret does not match',
      {},
    );
  }
}

/**
 * Raised when a passwordless challenge is missing required channel.
 *
 * @remarks
 * This error is thrown when validating a passwordless challenge aggregate
 * that is missing the required channel property.
 *
 * @example
 * ```typescript
 * // Thrown during aggregate validation
 * if (!this.props.channel) {
 *   throw PasswordlessChallengeChannelRequired.create();
 * }
 * ```
 */
export class PasswordlessChallengeChannelRequired extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.CHANNEL_REQUIRED';
  readonly message = 'Channel is required';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new PasswordlessChallengeChannelRequired instance.
   *
   * @returns New PasswordlessChallengeChannelRequired instance
   */
  static create(): PasswordlessChallengeChannelRequired {
    return new PasswordlessChallengeChannelRequired('Channel is required', {});
  }
}

/**
 * Raised when a passwordless challenge is missing required secret.
 *
 * @remarks
 * This error is thrown when validating a passwordless challenge aggregate
 * that is missing the required secret property.
 *
 * @example
 * ```typescript
 * // Thrown during aggregate validation
 * if (!this.props.secret) {
 *   throw PasswordlessChallengeSecretRequired.create();
 * }
 * ```
 */
export class PasswordlessChallengeSecretRequired extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.SECRET_REQUIRED';
  readonly message = 'Secret hash is required';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new PasswordlessChallengeSecretRequired instance.
   *
   * @returns New PasswordlessChallengeSecretRequired instance
   */
  static create(): PasswordlessChallengeSecretRequired {
    return new PasswordlessChallengeSecretRequired(
      'Secret hash is required',
      {},
    );
  }
}

/**
 * Raised when a passwordless challenge has invalid expiration time.
 *
 * @remarks
 * This error is thrown when validating a passwordless challenge aggregate
 * where the expiration time is not after the issued time.
 *
 * @example
 * ```typescript
 * // Thrown during aggregate validation
 * if (this.props.expiresAt <= this.props.issuedAt) {
 *   throw PasswordlessChallengeInvalidExpiration.create();
 * }
 * ```
 */
export class PasswordlessChallengeInvalidExpiration extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.INVALID_EXPIRATION';
  readonly message = 'Challenge expiration must be after issuedAt';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new PasswordlessChallengeInvalidExpiration instance.
   *
   * @returns New PasswordlessChallengeInvalidExpiration instance
   */
  static create(): PasswordlessChallengeInvalidExpiration {
    return new PasswordlessChallengeInvalidExpiration(
      'Challenge expiration must be after issuedAt',
      {},
    );
  }
}

/**
 * Raised when a passwordless challenge is not found.
 *
 * @remarks
 * This error is thrown when attempting to retrieve a passwordless challenge
 * that does not exist in the system.
 *
 * @example
 * ```typescript
 * // Thrown when challenge is not found
 * const challenge = await repository.findById(id);
 * if (!challenge) {
 *   throw PasswordlessChallengeNotFOuntError.create();
 * }
 * ```
 */
export class PasswordlessChallengeNotFoundError extends PasswordlessChallengeError {
  readonly code: DomainErrorCode = 'AUTH_PASSWORDLESS.CHALLENGE_NOT_FOUND';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  /**
   * Creates a new PasswordlessChallengeNotFOuntError instance.
   *
   * @returns New PasswordlessChallengeNotFOuntError instance
   */
  static create(): PasswordlessChallengeNotFoundError {
    return new PasswordlessChallengeNotFoundError(
      'Passwordless challenge not found',
      {},
    );
  }
}
