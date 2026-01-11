import { DomainError, DomainErrorType } from '@rineex/ddd';

export class InvalidScopeViolation extends DomainError {
  public readonly code = 'auth.scope.invalid';
  public readonly message = 'Scope format is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(): InvalidScopeViolation {
    return new InvalidScopeViolation();
  }
}
