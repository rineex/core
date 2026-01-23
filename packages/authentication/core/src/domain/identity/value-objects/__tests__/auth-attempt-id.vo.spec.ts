import { describe, expect, it } from 'vitest';

import { AuthAttemptId } from '../auth-attempt-id.vo';

describe('authAttemptId', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

  it('should create a valid AuthAttemptId with a valid UUID string', () => {
    const authAttemptId = AuthAttemptId.create(VALID_UUID);

    expect(authAttemptId).toBeInstanceOf(AuthAttemptId);
    expect(authAttemptId.getValue()).toBe(VALID_UUID);
  });

  it('should throw an error when creating with an empty string', () => {
    expect(() => AuthAttemptId.create('')).toThrow(
      'AuthAttemptId must be a valid non-empty identifier',
    );
  });

  it('should throw an error when creating with a string shorter than 16 characters', () => {
    expect(() => AuthAttemptId.create('short')).toThrow(
      'AuthAttemptId must be a valid non-empty identifier',
    );
  });

  it('should throw an error when creating with null or undefined', () => {
    expect(() => AuthAttemptId.create(null as any)).toThrow(
      'AuthAttemptId must be a valid non-empty identifier',
    );
    expect(() => AuthAttemptId.create(undefined as any)).toThrow(
      'AuthAttemptId must be a valid non-empty identifier',
    );
  });

  it('should accept a valid string with 16 or more characters', () => {
    const validId = '1234567890123456';
    const authAttemptId = AuthAttemptId.create(validId);

    expect(authAttemptId.getValue()).toBe(validId);
  });
});
