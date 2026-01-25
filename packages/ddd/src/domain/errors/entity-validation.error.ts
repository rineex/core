import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
  Primitive,
} from '@/shared';

interface ExtraProps extends Record<string, Primitive> {
  entityId?: string;
  entityType?: string;
}

type Props = Metadata<ExtraProps>;
/**
 * Custom error class for entity validation failures.
 */
export class EntityValidationError extends DomainError<Props> {
  public code: DomainErrorCode = 'CORE.VALIDATION_FAILED';
  public type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public constructor(message: string, props: Props) {
    super(message, props);
  }

  public static create(msg: string, props: Props) {
    return new EntityValidationError(msg, props);
  }
}
