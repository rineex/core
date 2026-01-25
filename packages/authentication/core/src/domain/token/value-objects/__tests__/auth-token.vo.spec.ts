import { describe, expect, it } from 'vitest';

import { AuthToken } from '../auth-token.vo';

// Concrete implementation for testing
class TestAuthToken extends AuthToken {
  readonly type = 'TEST';

  static fromString(value: string): TestAuthToken {
    return new TestAuthToken(value);
  }
}

describe('authToken', () => {
  it('should create a valid token with sufficient length', () => {
    const token = TestAuthToken.fromString('a'.repeat(32));

    expect(token).toBeInstanceOf(AuthToken);
    expect(token.value).toBe('a'.repeat(32));
    expect(token.type).toBe('TEST');
  });

  it('should create a valid token with longer length', () => {
    const longToken = 'a'.repeat(100);
    const token = TestAuthToken.fromString(longToken);

    expect(token.value).toBe(longToken);
  });

  it('should throw InvalidAuthTokenError when token is too short', () => {
    expect(() => TestAuthToken.fromString('short')).toThrow();
  });

  it('should throw InvalidAuthTokenError when token length is exactly 31', () => {
    expect(() => TestAuthToken.fromString('a'.repeat(31))).toThrow();
  });

  it('should accept token with exactly 32 characters', () => {
    const token = TestAuthToken.fromString('a'.repeat(32));

    expect(token.value).toBe('a'.repeat(32));
  });

  it('should convert to string correctly', () => {
    const tokenValue = 'a'.repeat(32);
    const token = TestAuthToken.fromString(tokenValue);

    expect(token.toString()).toBe(tokenValue);
  });
});
