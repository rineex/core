import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType, PrimitiveValueObject } from '@rineex/ddd';

class InvalidOAuthAuthorizationIdViolation extends AuthDomainViolation {
  readonly code = 'OAUTH_AUTHORIZATION_ID_INVALID';
  readonly message = 'OAuthAuthorization ID is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  public static create(props: { value: string }) {
    return new InvalidOAuthAuthorizationIdViolation(props);
  }
}

export class OAuthAuthorizationId extends PrimitiveValueObject<string> {
  public static create(value: string): OAuthAuthorizationId {
    return new OAuthAuthorizationId(value);
  }

  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidOAuthAuthorizationIdViolation.create({ value });
    }
  }
}
