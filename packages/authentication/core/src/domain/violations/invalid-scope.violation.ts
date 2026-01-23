import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type Scope = string;

type ExtraProps = { scope: Scope };

type M = Metadata<ExtraProps>;

export class InvalidScopeDomainError extends DomainError<M> {
  public readonly code: DomainErrorCode = 'AUTH_CORE_SCOPE.INVALID';
  public readonly message = 'Scope format is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(message: string, meta: M): InvalidScopeDomainError {
    return new InvalidScopeDomainError(message, meta);
  }
}
