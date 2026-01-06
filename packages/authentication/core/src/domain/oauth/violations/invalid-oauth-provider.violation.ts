import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class InvalidOAuthProviderViolation extends AuthDomainViolation {
  readonly code = 'OAUTH_PROVIDER_INVALID';
  readonly message = 'OAuth provider identifier is invalid';

  public static create(props: { value: string }) {
    return new InvalidOAuthProviderViolation({
      ...props,
      message: `OAuth provider identifier "${props.value}" is invalid`,
    });
  }
}
