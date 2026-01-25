import { InvalidValueObjectError } from '@rineex/ddd';

import { describe, expect, it } from 'vitest';

import { ChallengeSecret } from '../challenge-secret.vo';

describe('challengeSecret', () => {
  describe('create', () => {
    it('should create a valid secret with minimum length', () => {
      const secret = ChallengeSecret.create('1234');

      expect(secret).toBeInstanceOf(ChallengeSecret);
      expect(secret.value).toBe('1234');
    });

    it('should create a valid secret with OTP code', () => {
      const secret = ChallengeSecret.create('123456');

      expect(secret).toBeInstanceOf(ChallengeSecret);
      expect(secret.value).toBe('123456');
    });

    it('should create a valid secret with longer value', () => {
      const secret = ChallengeSecret.create('abcdefghijklmnop');

      expect(secret).toBeInstanceOf(ChallengeSecret);
      expect(secret.value).toBe('abcdefghijklmnop');
    });

    it('should throw InvalidValueObjectError for empty string', () => {
      expect(() => {
        ChallengeSecret.create('');
      }).toThrow(InvalidValueObjectError);
    });

    it('should throw InvalidValueObjectError for string shorter than 4 characters', () => {
      expect(() => {
        ChallengeSecret.create('123');
      }).toThrow(InvalidValueObjectError);

      expect(() => {
        ChallengeSecret.create('ab');
      }).toThrow(InvalidValueObjectError);

      expect(() => {
        ChallengeSecret.create('a');
      }).toThrow(InvalidValueObjectError);
    });

    it('should handle special characters in secret', () => {
      const specialSecret = '!@#$%^';
      const secret = ChallengeSecret.create(specialSecret);

      expect(secret.value).toBe(specialSecret);
    });

    it('should handle alphanumeric secrets', () => {
      const alphanumericSecret = 'a1b2c3d4';
      const secret = ChallengeSecret.create(alphanumericSecret);

      expect(secret.value).toBe(alphanumericSecret);
    });
  });

  describe('value', () => {
    it('should return the secret value', () => {
      const secret = ChallengeSecret.create('123456');

      expect(secret.value).toBe('123456');
    });
  });
});
