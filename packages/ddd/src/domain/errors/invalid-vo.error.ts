import { DomainError, Metadata } from '@/shared';

type Params = {
  value: string;
};

type Props = Metadata<Params>;

export class InvalidValueObjectError extends DomainError<
  'DOMAIN.INVALID_VALUE',
  Props
> {
  public readonly code = 'DOMAIN.INVALID_VALUE' as const;

  private constructor(msg: string, meta?: Props) {
    super(msg, meta);
  }

  public static create(
    msg = 'Provided value object is incorrect',
    meta?: Props,
  ) {
    return new InvalidValueObjectError(msg, meta);
  }
}
