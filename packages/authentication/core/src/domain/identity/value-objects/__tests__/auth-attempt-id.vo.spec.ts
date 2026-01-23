import { describe, expect, it } from 'vitest';

import { AuthAttemptId } from '../auth-attempt-id.vo';

describe('authAttemptId', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

  it('should create a valid AuthAttemptId with a valid UUID string', () => {
    const authAttemptId = AuthAttemptId.fromString(VALID_UUID);

    expect(authAttemptId).toBeInstanceOf(AuthAttemptId);
    expect(authAttemptId.value).toBe(VALID_UUID);
  });

  it('should throw an error when creating with an empty string', () => {
    expect(() => AuthAttemptId.fromString('')).toThrow('Invalid UUID');
  });

  it('should throw an error when creating with an invalid UUID', () => {
    expect(() => AuthAttemptId.fromString('short')).toThrow('Invalid UUID');
    expect(() => AuthAttemptId.fromString('not-a-uuid')).toThrow(
      'Invalid UUID',
    );
    expect(() => AuthAttemptId.fromString('550e8400-e29b-41d4-a716')).toThrow(
      'Invalid UUID',
    );
  });

  it('should throw an error when creating with null or undefined', () => {
    expect(() => AuthAttemptId.fromString(null as any)).toThrow();
    expect(() => AuthAttemptId.fromString(undefined as any)).toThrow();
  });

  it('should generate a valid AuthAttemptId', () => {
    const authAttemptId = AuthAttemptId.generate();

    expect(authAttemptId).toBeInstanceOf(AuthAttemptId);
    expect(authAttemptId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
