import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { PrimitiveValueObject } from '@rineex/ddd';

class InvalidOAuthAuthorizationIdViolation extends AuthDomainViolation {
  readonly code = 'OAUTH_AUTHORIZATION_ID_INVALID';
  readonly message = 'OAuthAuthorization ID is invalid';

  public static create(props: { value: string }) {
    return new InvalidOAuthAuthorizationIdViolation(props);
  }
}

export class OAuthAuthorizationId extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidOAuthAuthorizationIdViolation.create({ value });
    }
  }
}
