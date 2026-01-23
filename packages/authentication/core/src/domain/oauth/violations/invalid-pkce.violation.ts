import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';
import { DomainErrorType } from '@rineex/ddd';

export class InvalidPkceViolation extends AuthDomainViolation {
  readonly code = 'PKCE_INVALID';
  readonly message = 'PKCE parameters are invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(details?: Record<string, any>): InvalidPkceViolation {
    return new InvalidPkceViolation({ ...details });
  }
}
