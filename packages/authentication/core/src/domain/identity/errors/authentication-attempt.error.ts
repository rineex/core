import {
  DomainError,
  DomainErrorCode,
  DomainErrorType,
  Metadata,
} from '@rineex/ddd';

type ExtraProps = {
  attemptId?: string;
  identityId?: string;
  method?: string;
  status?: string;
  attempts?: number;
};

type Props = Metadata<ExtraProps>;

export class AuthenticationAttemptError extends DomainError<Props> {
  public readonly code: DomainErrorCode =
    'AUTH_CORE_ATTEMPT.AUTHENTICATION_FAILED';
  public readonly type: DomainErrorType = 'DOMAIN.INVALID_STATE';

  public constructor(message: string, props: Props) {
    super(message, { ...props });
  }
}

export class AuthenticationAttemptMethodRequiredError extends AuthenticationAttemptError {
  public constructor({
    identityId,
    attemptId,
  }: Pick<Props, 'attemptId' | 'identityId'>) {
    super('AuthenticationAttempt must have a method', {
      identityId,
      attemptId,
    });
  }
}

export class AuthenticationAttemptStatusRequiredError extends AuthenticationAttemptError {
  public constructor({
    identityId,
    attemptId,
  }: Pick<Props, 'attemptId' | 'identityId'>) {
    super('AuthenticationAttempt must have a status', {
      identityId,
      attemptId,
    });
  }
}

export class AuthenticationAttemptAlreadyCompletedError extends AuthenticationAttemptError {
  public constructor({
    identityId,
    attemptId,
    status,
  }: Pick<Props, 'attemptId' | 'identityId' | 'status'>) {
    super('AuthenticationAttempt already completed', {
      identityId,
      attemptId,
      status,
    });
  }
}

export class AuthenticationAttemptFailureReasonRequiredError extends AuthenticationAttemptError {
  public constructor({
    identityId,
    attemptId,
    reason,
  }: Pick<Props, 'attemptId' | 'identityId'> & { reason?: string }) {
    super(`AuthenticationAttempt failure reason is required: ${reason}`, {
      identityId,
      attemptId,
    });
  }
}

export class AuthenticationAttemptExceeded extends AuthenticationAttemptError {
  public constructor({
    identityId,
    attemptId,
    attempts,
    status,
  }: Pick<Props, 'attemptId' | 'attempts' | 'identityId' | 'status'>) {
    super('AuthenticationAttempt ', {
      identityId,
      attemptId,
      attempts,
      status,
    });
  }
}

export class AuthenticationAttemptNotFound extends AuthenticationAttemptError {
  public readonly code: DomainErrorCode = 'AUTH_CORE_ATTEMPT.NOT_FOUND';

  public constructor({ attemptId }: Pick<Props, 'attemptId'>) {
    super('Authentication attempt does not exist or is no longer valid', {
      attemptId,
    });
  }
}
