import { DomainError, Metadata, Primitive } from '@/shared';

interface ExtraProps extends Record<string, Primitive> {
  entityId?: string;
  entityType?: string;
}

type Props = Metadata<ExtraProps>;

/**
 * Custom error class for entity validation failures.
 */
export class EntityValidationError extends DomainError<
  'CORE.VALIDATION_FAILED',
  Props
> {
  public readonly code = 'CORE.VALIDATION_FAILED' as const;

  public constructor(message: string, props: Props) {
    super(message, props);
  }

  public static create(msg: string, props: Props) {
    return new EntityValidationError(msg, props);
  }
}
