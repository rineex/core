import { expectType } from 'tsd';

import { EntityValidationError } from '../../../domain/errors/entity-validation.error';
import { ApplicationError } from '../../../application/errors/application.error';
import { InvalidStateError } from '../errors/invalid-state.error';
import type { Err, Ok, Result } from '../result';
import { Result as ResultNs } from '../result';
import { DomainError } from '../domain.error';

class SampleAppError extends ApplicationError {
  constructor() {
    super({ code: 'SAMPLE', message: 'x' });
  }
}

class TypedDomainError extends DomainError<
  'CORE.VALIDATION_FAILED',
  { entityId: string }
> {
  readonly code = 'CORE.VALIDATION_FAILED' as const;

  constructor(entityId: string) {
    super('validation failed', { entityId });
  }
}

const okNumber = ResultNs.ok(42);
const errDomain = ResultNs.err(new InvalidStateError('bad'));
const errApp = ResultNs.err(new SampleAppError());
const typedError = new TypedDomainError('ent-1');

expectType<Ok<number>>(okNumber);
expectType<Err<InvalidStateError>>(errDomain);
expectType<Err<SampleAppError>>(errApp);
expectType<'CORE.VALIDATION_FAILED'>(typedError.code);
expectType<Readonly<{ entityId: string }>>(typedError.metadata);

if (ResultNs.isOk(okNumber)) {
  expectType<number>(okNumber.value);
}

if (ResultNs.isErr(errDomain)) {
  expectType<InvalidStateError>(errDomain.error);
}

const matched = ResultNs.match(okNumber, {
  ok: value => value,
  err: () => 0,
});
expectType<number>(matched);

const chained: Result<string, InvalidStateError> = ResultNs.flatMap(
  okNumber,
  n => ResultNs.ok(String(n)),
);
expectType<Result<string, InvalidStateError>>(chained);

const validationErr = EntityValidationError.create('x', {});
expectType<'CORE.VALIDATION_FAILED'>(validationErr.code);
