import { DomainViolation } from '@rineex/ddd';

export class InvalidScopeViolation extends DomainViolation {
  public readonly code = 'auth.scope.invalid';
  public readonly message = 'Scope format is invalid';

  public static create(): InvalidScopeViolation {
    return new InvalidScopeViolation();
  }
}
