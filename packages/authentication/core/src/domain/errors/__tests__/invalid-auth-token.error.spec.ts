import { describe, expect, it } from 'vitest';

import { InvalidAuthTokenError } from '../invalid-auth-token.error';

describe('invalidAuthTokenError', () => {
  it('should create an error with default message', () => {
    const error = InvalidAuthTokenError.create(
      'Authentication token is invalid',
      {
        actualLength: 20,
        minLength: 32,
      },
    );

    expect(error).toBeInstanceOf(InvalidAuthTokenError);
    expect(error.message).toBe('Authentication token is invalid');
    expect(error.code).toBe('AUTH_CORE_TOKEN.INVALID');
    expect(error.type).toBe('DOMAIN.INVALID_VALUE');
    expect(error.metadata.actualLength).toBe(20);
    expect(error.metadata.minLength).toBe(32);
  });

  it('should serialize to object correctly', () => {
    const error = InvalidAuthTokenError.create('Token too short', {
      actualLength: 10,
      minLength: 32,
    });

    const serialized = error.toObject();

    expect(serialized).toEqual({
      metadata: {
        actualLength: 10,
        minLength: 32,
      },
      code: 'AUTH_CORE_TOKEN.INVALID',
      type: 'DOMAIN.INVALID_VALUE',
      message: 'Token too short',
    });
  });

  it('should convert to string correctly', () => {
    const error = InvalidAuthTokenError.create('Token invalid', {
      actualLength: 20,
      minLength: 32,
    });

    expect(error.toString()).toBe('[AUTH_CORE_TOKEN.INVALID] Token invalid');
  });
});
