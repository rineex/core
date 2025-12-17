import { DomainError } from '../base/domain.error';

export class InvalidValueObjectError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_VALUE_OBJECT');
  }
}
