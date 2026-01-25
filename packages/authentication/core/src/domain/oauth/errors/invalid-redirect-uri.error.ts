import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  redirectUri: string;
};

type Props = Metadata<ExtraProps>;

/**
 * Raised when a redirect URI is invalid or insecure.
 *
 * @remarks
 * This error is thrown when an OAuth redirect URI fails validation:
 * - URI format is invalid
 * - URI is not registered for the client
 * - URI uses an insecure protocol (e.g., http instead of https)
 * - URI contains invalid characters or structure
 *
 * @example
 * ```typescript
 * // Thrown when redirect URI is invalid
 * throw InvalidRedirectUriError.create({ redirectUri: 'http://insecure.com' });
 * ```
 */
export class InvalidRedirectUriError extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_OAUTH.INVALID_REDIRECT_URI';
  readonly message = 'Redirect URI is invalid or insecure';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  /**
   * Creates a new InvalidRedirectUriError instance.
   *
   * @param props - Object containing the invalid redirect URI
   * @returns New InvalidRedirectUriError instance
   */
  public static create(props: Props): InvalidRedirectUriError {
    return new InvalidRedirectUriError(
      `Redirect URI "${props.redirectUri}" is invalid or insecure`,
      props,
    );
  }
}
