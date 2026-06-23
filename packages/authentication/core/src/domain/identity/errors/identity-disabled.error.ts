import { DomainError, Metadata } from '@rineex/ddd';

type ExtraProps = {
  identityId: string;
};
type Props = Metadata<ExtraProps>;

export class IdentityDisabledError extends DomainError<
  'AUTH_CORE_IDENTITY.DISABLED_ERROR',
  Props
> {
  readonly code = 'AUTH_CORE_IDENTITY.DISABLED_ERROR' as const;
  readonly message = 'Identity is disabled';

  private constructor(message: string, props: Props) {
    super(message, props);
  }

  public static create(message: string, props: Props): IdentityDisabledError {
    return new IdentityDisabledError(message, props);
  }
}
