import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType } from '@rineex/ddd';

export class InvalidOAuthProviderViolation extends AuthDomainViolation {
  readonly code = 'OAUTH_PROVIDER_INVALID';
  readonly message = 'OAuth provider identifier is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  public static create(props: { value: string }) {
    return new InvalidOAuthProviderViolation({
      ...props,
      message: `OAuth provider identifier "${props.value}" is invalid`,
    });
  }
}
