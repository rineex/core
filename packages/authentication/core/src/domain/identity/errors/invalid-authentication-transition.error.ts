import { DomainError, Metadata } from '@rineex/ddd';

type ExtraProps = {
  status: string;
};

type Props = Metadata<ExtraProps>;

export class InvalidAuthenticationTransitionError extends DomainError<
  'AUTH_CORE_IDENTITY.INVALID_TRANSITION',
  Props
> {
  public readonly code = 'AUTH_CORE_IDENTITY.INVALID_TRANSITION' as const;

  private constructor(msg: string, meta: Props) {
    super(msg, meta);
  }

  public static create(msg: string, props: Props) {
    return new InvalidAuthenticationTransitionError(msg, props);
  }
}
