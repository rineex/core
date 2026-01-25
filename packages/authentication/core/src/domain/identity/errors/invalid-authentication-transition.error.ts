import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  status: string;
};

type Props = Metadata<ExtraProps>;

export class InvalidAuthenticationTransitionError extends DomainError<Props> {
  public readonly code: DomainErrorCode =
    'AUTH_CORE_IDENTITY.INVALID_TRANSITION';
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  private constructor(msg: string, meta: Props) {
    super(msg, meta);
  }

  public static create(msg: string, props: Props) {
    return new InvalidAuthenticationTransitionError(msg, props);
  }
}
