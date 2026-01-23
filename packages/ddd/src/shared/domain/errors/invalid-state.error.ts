import { DomainError, DomainErrorCode, DomainErrorType } from '../domain.error';

export class InvalidStateError extends DomainError {
  public code: DomainErrorCode = 'DOMAIN.INVALID_STATE';
  public type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  constructor(message = 'invalid state') {
    super(message, undefined);
  }
}
