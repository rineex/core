import { describe, expect, it } from 'vitest';

import { InvalidSessionError } from '../invalid-session.error';

describe('invalidSessionError', () => {
  it('should create an error with default message', () => {
    const error = InvalidSessionError.create();

    expect(error).toBeInstanceOf(InvalidSessionError);
    expect(error.message).toBe('Session state is invalid');
    expect(error.code).toBe('AUTH_CORE_SESSION.INVALID');
  });

  it('should serialize to object correctly', () => {
    const error = InvalidSessionError.create();

    const serialized = error.toObject();

    expect(serialized).toEqual({
      message: 'Session state is invalid',
      code: 'AUTH_CORE_SESSION.INVALID',
      metadata: {},
    });
  });

  it('should convert to string correctly', () => {
    const error = InvalidSessionError.create();

    expect(error.toString()).toBe(
      '[AUTH_CORE_SESSION.INVALID] Session state is invalid',
    );
  });
});
