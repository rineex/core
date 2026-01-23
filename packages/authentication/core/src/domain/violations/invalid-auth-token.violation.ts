import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  actualLength: number;
  minLength: number;
};
type Props = Metadata<ExtraProps>;
/**
 * Raised when an authentication token violates domain invariants.
 */
export class InvalidAuthTokenViolation extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_TOKEN.INVALID';
  readonly message = 'Authentication token is invalid';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public static create(message: string, meta: Props) {
    return new InvalidAuthTokenViolation(message, meta);
  }
}
