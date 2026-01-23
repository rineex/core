import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType } from '@rineex/ddd';

export class InvalidAuthorizationCodeViolation extends AuthDomainViolation {
  readonly code = 'AUTH_CODE_INVALID';
  readonly message = 'Authorization code is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  public static create(
    details?: Record<string, any>,
  ): InvalidAuthorizationCodeViolation {
    return new InvalidAuthorizationCodeViolation({ ...details });
  }
}
