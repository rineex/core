import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@/shared';

type Params = {
  value: string;
};

type Props = Metadata<Params>;
export class InvalidValueObjectError extends DomainError<Props> {
  public code = 'DOMAIN.INVALID_VALUE' as DomainErrorCode;
  public type: DomainErrorType = 'DOMAIN.INVALID_VALUE';

  public static create(
    msg = 'Provided value object is incorrect',
    meta?: Props,
  ) {
    return new InvalidValueObjectError(msg, meta);
  }
}
