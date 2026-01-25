import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  identityId: string;
};
type Props = Metadata<ExtraProps>;

export class IdentityDisabledError extends DomainError<Props> {
  readonly code: DomainErrorCode = 'AUTH_CORE_IDENTITY.DISABLED_ERROR';
  readonly message = 'Identity is disabled';
  readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  private constructor(message: string, props: Props) {
    super(message, props);
  }

  public static create(message: string, props: Props): IdentityDisabledError {
    return new IdentityDisabledError(message, props);
  }
}
