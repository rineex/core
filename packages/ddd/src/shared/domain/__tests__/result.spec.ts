import { describe, expect, it } from 'vitest';

import { DomainError, DomainErrorCode } from '../domain.error';
import { Result } from '../result';

// Test error classes
class InvalidValueError extends DomainError {
  public get code(): DomainErrorCode {
    return 'DOMAIN.INVALID_VALUE';
  }

  constructor(
    message: string,
    metadata?: Record<string, boolean | number | string>,
  ) {
    super({ metadata, message });
  }
}

class InvalidStateError extends DomainError {
  public get code(): DomainErrorCode {
    return 'DOMAIN.INVALID_STATE';
  }

  constructor(
    message: string,
    metadata?: Record<string, boolean | number | string>,
  ) {
    super({ metadata, message });
  }
}

// Custom error type for testing
interface ValidationError {
  field: string;
  message: string;
}

describe('result', () => {
  describe('result.ok()', () => {
    it('should create a successful result with a primitive value', () => {
      const result = Result.ok(42);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe(42);
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with a string value', () => {
      const result = Result.ok('test');

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe('test');
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with a boolean value', () => {
      const result = Result.ok(true);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe(true);
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with an object', () => {
      const user = { email: 'john@example.com', name: 'John', id: 1 };
      const result = Result.ok(user);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toEqual(user);
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with an array', () => {
      const items = [1, 2, 3];
      const result = Result.ok(items);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toEqual(items);
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with null', () => {
      const result = Result.ok<null>(null);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBeNull();
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with undefined', () => {
      const result = Result.ok(undefined);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBeUndefined();
      expect(result.getError()).toBeUndefined();
    });

    it('should create a successful result with a class instance', () => {
      class User {
        constructor(
          public readonly id: number,
          public readonly name: string,
        ) {}
      }

      const user = new User(1, 'Alice');
      const result = Result.ok(user);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe(user);
      expect(result.getError()).toBeUndefined();
    });

    it('should preserve the exact value reference', () => {
      const originalValue = { id: 1 };
      const result = Result.ok(originalValue);

      expect(result.getValue()).toBe(originalValue);
    });
  });

  describe('result.fail()', () => {
    it('should create a failed result with DomainError', () => {
      const error = new InvalidValueError('Value must be positive');
      const result = Result.fail(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
      expect(result.getValue()).toBeUndefined();
    });

    it('should create a failed result with custom error type', () => {
      const error: ValidationError = {
        message: 'Invalid email format',
        field: 'email',
      };
      const result = Result.fail<never, ValidationError>(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
      expect(result.getValue()).toBeUndefined();
    });

    it('should create a failed result with error containing metadata', () => {
      const error = new InvalidValueError('Validation failed', {
        field: 'age',
        max: 100,
        min: 18,
      });
      const result = Result.fail(error);

      expect(result.isFailure).toBe(true);

      const returnedError = result.getError();

      expect(returnedError).toBe(error);

      if (returnedError instanceof InvalidValueError) {
        expect(returnedError.metadata).toEqual({
          field: 'age',
          max: 100,
          min: 18,
        });
      }
    });

    it('should preserve the exact error reference', () => {
      const originalError = new InvalidStateError('Invalid state');
      const result = Result.fail(originalError);

      expect(result.getError()).toBe(originalError);
    });
  });

  describe('isSuccess and isFailure properties', () => {
    it('should have isSuccess true and isFailure false for successful results', () => {
      const result = Result.ok(42);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
    });

    it('should have isSuccess false and isFailure true for failed results', () => {
      const error = new InvalidValueError('Error');
      const result = Result.fail(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
    });

    it('should have mutually exclusive isSuccess and isFailure', () => {
      const successResult = Result.ok(42);
      const failureResult = Result.fail(new InvalidValueError('Error'));

      expect(successResult.isSuccess).not.toBe(successResult.isFailure);
      expect(failureResult.isSuccess).not.toBe(failureResult.isFailure);
    });
  });

  describe('getValue()', () => {
    it('should return the value for successful results', () => {
      const value = { name: 'John', id: 1 };
      const result = Result.ok(value);

      expect(result.getValue()).toBe(value);
    });

    it('should return undefined for failed results', () => {
      const error = new InvalidValueError('Error');
      const result = Result.fail(error);

      expect(result.getValue()).toBeUndefined();
    });

    it('should return undefined for successful results with undefined value', () => {
      const result = Result.ok(undefined);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeUndefined();
    });

    it('should return null for successful results with null value', () => {
      const result = Result.ok<null>(null);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeNull();
    });
  });

  describe('getError()', () => {
    it('should return the error for failed results', () => {
      const error = new InvalidValueError('Validation failed');
      const result = Result.fail(error);

      expect(result.getError()).toBe(error);
    });

    it('should return undefined for successful results', () => {
      const result = Result.ok(42);

      expect(result.getError()).toBeUndefined();
    });

    it('should return the exact error instance', () => {
      const error1 = new InvalidValueError('Error 1');
      const error2 = new InvalidStateError('Error 2');

      const result1 = Result.fail(error1);
      const result2 = Result.fail(error2);

      expect(result1.getError()).toBe(error1);
      expect(result2.getError()).toBe(error2);
      expect(result1.getError()).not.toBe(result2.getError());
    });
  });

  describe('isSuccessResult()', () => {
    it('should return true for successful results', () => {
      const result = Result.ok(42);

      expect(result.isSuccessResult()).toBe(true);
    });

    it('should return false for failed results', () => {
      const error = new InvalidValueError('Error');
      const result = Result.fail(error);

      expect(result.isSuccessResult()).toBe(false);
    });

    it('should act as a type guard narrowing the type', () => {
      const result = Result.ok({ name: 'John', id: 1 });

      if (result.isSuccessResult()) {
        // TypeScript should narrow the type here
        const value = result.getValue();

        expect(value).toBeDefined();
        expect(value?.id).toBe(1);
        expect(value?.name).toBe('John');
      }
    });
  });

  describe('isFailureResult()', () => {
    it('should return true for failed results', () => {
      const error = new InvalidValueError('Error');
      const result = Result.fail(error);

      expect(result.isFailureResult()).toBe(true);
    });

    it('should return false for successful results', () => {
      const result = Result.ok(42);

      expect(result.isFailureResult()).toBe(false);
    });

    it('should act as a type guard narrowing the type', () => {
      const error = new InvalidValueError('Validation failed');
      const result = Result.fail(error);

      if (result.isFailureResult()) {
        // TypeScript should narrow the type here
        const errorValue = result.getError();

        expect(errorValue).toBeDefined();
        expect(errorValue).toBe(error);
      }
    });
  });

  describe('immutability', () => {
    it('should freeze the Result instance', () => {
      const result = Result.ok(42);

      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should freeze failed Result instances', () => {
      const error = new InvalidValueError('Error');
      const result = Result.fail(error);

      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should maintain type information for success values', () => {
      interface User {
        id: number;
        name: string;
      }

      const user: User = { name: 'John', id: 1 };
      const result = Result.ok(user);

      const value = result.getValue();
      if (value) {
        // TypeScript should know value is User here
        expect(typeof value.id).toBe('number');
        expect(typeof value.name).toBe('string');
      }
    });

    it('should maintain type information for error values', () => {
      const error = new InvalidValueError('Error');
      const result = Result.fail(error);

      const errorValue = result.getError();
      if (errorValue) {
        // TypeScript should know errorValue is DomainError here
        expect(errorValue.message).toBe('Error');
        expect(errorValue.code).toBe('DOMAIN.INVALID_VALUE');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as success value', () => {
      const result = Result.ok('');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe('');
    });

    it('should handle zero as success value', () => {
      const result = Result.ok(0);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(0);
    });

    it('should handle false as success value', () => {
      const result = Result.ok(false);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });

    it('should handle empty object as success value', () => {
      const result = Result.ok({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({});
    });

    it('should handle empty array as success value', () => {
      const result = Result.ok([]);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual([]);
    });

    it('should handle nested objects as success value', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      };
      const result = Result.ok(nested);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(nested);
    });

    it('should handle complex error with nested metadata', () => {
      const error = new InvalidValueError('Complex error', {
        nested: JSON.stringify({ key: 'value' }),
        active: true,
        count: 42,
      });
      const result = Result.fail(error);

      expect(result.isFailure).toBe(true);

      const returnedError = result.getError();
      if (returnedError instanceof InvalidValueError) {
        expect(returnedError.metadata.nested).toBe('{"key":"value"}');
        expect(returnedError.metadata.count).toBe(42);
        expect(returnedError.metadata.active).toBe(true);
      }
    });
  });

  describe('usage patterns', () => {
    it('should work with validation pattern', () => {
      function validateAge(age: number): Result<number, DomainError> {
        if (age < 0) {
          return Result.fail(new InvalidValueError('Age cannot be negative'));
        }
        if (age > 150) {
          return Result.fail(new InvalidValueError('Age seems unrealistic'));
        }
        return Result.ok(age);
      }

      const validResult = validateAge(25);

      expect(validResult.isSuccess).toBe(true);
      expect(validResult.getValue()).toBe(25);

      const negativeResult = validateAge(-5);

      expect(negativeResult.isFailure).toBe(true);
      expect(negativeResult.getError()?.message).toBe('Age cannot be negative');

      const tooOldResult = validateAge(200);

      expect(tooOldResult.isFailure).toBe(true);
      expect(tooOldResult.getError()?.message).toBe('Age seems unrealistic');
    });

    it('should work with chaining pattern', () => {
      function validateEmail(email: string): Result<string, DomainError> {
        if (!email.includes('@')) {
          return Result.fail(new InvalidValueError('Invalid email format'));
        }
        return Result.ok(email);
      }

      function createAccount(
        email: string,
      ): Result<{ email: string }, DomainError> {
        const emailResult = validateEmail(email);
        if (emailResult.isFailureResult()) {
          return emailResult;
        }

        const validatedEmail = emailResult.getValue()!;
        return Result.ok({ email: validatedEmail });
      }

      const validResult = createAccount('test@example.com');

      expect(validResult.isSuccess).toBe(true);
      expect(validResult.getValue().email).toBe('test@example.com');

      const invalidResult = createAccount('invalid-email');

      expect(invalidResult.isFailure).toBe(true);
      expect(invalidResult.getError().message).toBe('Invalid email format');
    });

    it('should work with void operations', () => {
      function deleteUser(id: number): Result<void, DomainError> {
        if (id <= 0) {
          return Result.fail(new InvalidValueError('Invalid user ID'));
        }
        // ... deletion logic ...
        return Result.ok(undefined);
      }

      const successResult = deleteUser(123);

      expect(successResult.isSuccess).toBe(true);
      expect(successResult.getValue()).toBeUndefined();

      const failureResult = deleteUser(-1);

      expect(failureResult.isFailure).toBe(true);
      expect(failureResult.getError()?.message).toBe('Invalid user ID');
    });
  });
});
