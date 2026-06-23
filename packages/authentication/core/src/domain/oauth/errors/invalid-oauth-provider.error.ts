import { DomainError, Metadata } from '@rineex/ddd';

type ExtraProps = {
  value: string;
};

type Props = Metadata<ExtraProps>;

/**
 * Raised when an OAuth provider identifier is invalid.
 *
 * @remarks
 * This error is thrown when an OAuth provider identifier does not match
 * any registered or supported OAuth providers in the system.
 *
 * @example
 * ```typescript
 * // Thrown when provider is invalid
 * throw InvalidOAuthProviderError.create({ value: 'invalid_provider' });
 * ```
 */
export class InvalidOAuthProviderError extends DomainError<
  'AUTH_CORE_OAUTH.INVALID_PROVIDER',
  Props
> {
  readonly code = 'AUTH_CORE_OAUTH.INVALID_PROVIDER' as const;
  readonly message = 'OAuth provider identifier is invalid';

  /**
   * Creates a new InvalidOAuthProviderError instance.
   *
   * @param props - Object containing the invalid provider value
   * @returns New InvalidOAuthProviderError instance
   */
  public static create(props: Props): InvalidOAuthProviderError {
    return new InvalidOAuthProviderError(
      `OAuth provider identifier "${props.value}" is invalid`,
      props,
    );
  }
}
