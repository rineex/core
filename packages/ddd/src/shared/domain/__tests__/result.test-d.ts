import { expectType } from 'tsd';

import { ApplicationError } from '../../../application/errors/application.error';
import { InvalidStateError } from '../errors/invalid-state.error';
import type { Err, Ok, Result } from '../result';
import { Result as ResultNs } from '../result';

class SampleAppError extends ApplicationError {
  constructor() {
    super({ code: 'SAMPLE', message: 'x' });
  }
}

const okNumber = ResultNs.ok(42);
const errDomain = ResultNs.err(new InvalidStateError('bad'));
const errApp = ResultNs.err(new SampleAppError());

expectType<Ok<number>>(okNumber);
expectType<Err<InvalidStateError>>(errDomain);
expectType<Err<SampleAppError>>(errApp);

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
