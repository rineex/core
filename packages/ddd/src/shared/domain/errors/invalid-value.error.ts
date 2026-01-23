import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '../domain.error';

type Args<T> = Metadata<T>;

export class InvalidValueError<T> extends DomainError<Args<T>> {
  public code: DomainErrorCode = 'DOMAIN.INVALID_VALUE';
  public type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  constructor(msg = 'invalid value', meta?: Args<T>) {
    super(msg, meta);
  }
}
