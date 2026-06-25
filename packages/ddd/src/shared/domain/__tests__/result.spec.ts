import { describe, expect, it } from 'vitest';

import { ApplicationError } from '../../../application/errors/application.error';
import { InvalidValueError } from '../errors/invalid-value.error';
import { Result } from '../result';

class TestApplicationError extends ApplicationError {
  constructor() {
    super({
      message: 'application failure',
      code: 'TEST.APP_ERROR',
      isOperational: true,
    });
  }
}

describe('result', () => {
  describe('construction', () => {
    it('creates a frozen ok result with the given value', () => {
      const value = { id: 1 };
      const result = Result.ok(value);

      expect(result).toEqual({ kind: 'ok', value });
      expect(Object.isFrozen(result)).toBe(true);
      expect(result.value).toBe(value);
    });

    it('creates a frozen ok result without a value', () => {
      const result = Result.ok();

      expect(result).toEqual({ value: undefined, kind: 'ok' });
      expect(Object.isFrozen(result)).toBe(true);
      expect(Result.isOk(result)).toBe(true);
    });

    it('creates a frozen err result with the given error', () => {
      const error = new InvalidValueError('invalid');
      const result = Result.err(error);

      expect(result).toEqual({ kind: 'err', error });
      expect(Object.isFrozen(result)).toBe(true);
      expect(result.error).toBe(error);
    });

    it('accepts ApplicationError in the error channel', () => {
      const error = new TestApplicationError();
      const result = Result.err(error);

      expect(Result.isErr(result)).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('narrowing', () => {
    it('isOk narrows to value', () => {
      const result = Result.ok(42);

      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      } else {
        throw new Error('expected ok');
      }
    });

    it('isErr narrows to error', () => {
      const error = new InvalidValueError('bad');
      const result = Result.err(error);

      if (Result.isErr(result)) {
        expect(result.error).toBe(error);
      } else {
        throw new Error('expected err');
      }
    });
  });

  describe('match', () => {
    it('invokes ok handler for success', () => {
      const result = Result.ok('value');

      const out = Result.match(result, {
        ok: value => `ok:${value}`,
        err: () => 'err',
      });

      expect(out).toBe('ok:value');
    });

    it('invokes err handler for failure', () => {
      const error = new InvalidValueError('nope');
      const result = Result.err(error);

      const out = Result.match(result, {
        err: e => `err:${e.message}`,
        ok: () => 'ok',
      });

      expect(out).toBe('err:nope');
    });
  });

  describe('flatMap', () => {
    function validateAge(age: number): Result<number, InvalidValueError> {
      if (age < 0) {
        return Result.err(new InvalidValueError('Age cannot be negative'));
      }

      return Result.ok(age);
    }

    it('forwards err unchanged', () => {
      const failed = validateAge(-1);
      const chained = Result.flatMap(failed, age => Result.ok(age * 2));

      expect(Result.isErr(chained)).toBe(true);

      if (Result.isErr(chained)) {
        expect(chained.error.message).toBe('Age cannot be negative');
      }
    });

    it('chains ok values', () => {
      const chained = Result.flatMap(validateAge(10), age =>
        Result.ok(age * 2),
      );

      expect(Result.isOk(chained)).toBe(true);

      if (Result.isOk(chained)) {
        expect(chained.value).toBe(20);
      }
    });

    it('supports use-case chaining without non-null assertions', () => {
      function validateEmail(email: string): Result<string, InvalidValueError> {
        if (!email.includes('@')) {
          return Result.err(new InvalidValueError('Invalid email format'));
        }

        return Result.ok(email);
      }

      function createAccount(
        email: string,
      ): Result<{ email: string }, InvalidValueError> {
        return Result.flatMap(validateEmail(email), validated =>
          Result.ok({ email: validated }),
        );
      }

      const valid = createAccount('a@b.com');

      expect(Result.isOk(valid)).toBe(true);

      if (Result.isOk(valid)) {
        expect(valid.value).toEqual({ email: 'a@b.com' });
      }

      const invalid = createAccount('bad');

      expect(Result.isErr(invalid)).toBe(true);

      if (Result.isErr(invalid)) {
        expect(invalid.error.message).toBe('Invalid email format');
      }
    });
  });

  describe('map', () => {
    it('transforms ok values', () => {
      const result = Result.map(Result.ok(2), n => n * 3);

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(6);
      }
    });

    it('preserves err', () => {
      const error = new InvalidValueError('x');
      const result = Result.map(Result.err(error), (n: number) => n * 3);

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.error).toBe(error);
      }
    });
  });

  describe('mapError', () => {
    it('transforms err values', () => {
      const result = Result.mapError(
        Result.err(new InvalidValueError('a')),
        e => new InvalidValueError(`${e.message}!`),
      );

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.error.message).toBe('a!');
      }
    });

    it('preserves ok', () => {
      const result = Result.mapError(Result.ok(1), e => e);

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(1);
      }
    });
  });
});
