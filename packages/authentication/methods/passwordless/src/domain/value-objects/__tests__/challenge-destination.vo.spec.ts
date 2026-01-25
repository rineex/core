import { InvalidValueObjectError } from '@rineex/ddd';

import { describe, expect, it } from 'vitest';

import { ChallengeDestination } from '../challenge-destination.vo';

describe('challengeDestination', () => {
  describe('create', () => {
    it('should create a valid destination with email address', () => {
      const destination = ChallengeDestination.create('user@example.com');

      expect(destination).toBeInstanceOf(ChallengeDestination);
      expect(destination.value).toBe('user@example.com');
    });

    it('should create a valid destination with phone number', () => {
      const destination = ChallengeDestination.create('+1234567890');

      expect(destination).toBeInstanceOf(ChallengeDestination);
      expect(destination.value).toBe('+1234567890');
    });

    it('should create a valid destination with minimum length', () => {
      const destination = ChallengeDestination.create('abc');

      expect(destination).toBeInstanceOf(ChallengeDestination);
      expect(destination.value).toBe('abc');
    });

    it('should throw InvalidValueObjectError for empty string', () => {
      expect(() => {
        ChallengeDestination.create('');
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(InvalidValueObjectError);
    });

    it('should throw InvalidValueObjectError for string shorter than 3 characters', () => {
      expect(() => {
        ChallengeDestination.create('ab');
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(InvalidValueObjectError);

      expect(() => {
        ChallengeDestination.create('a');
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
      }).toThrow(InvalidValueObjectError);
    });

    it('should handle long destination strings', () => {
      const longDestination = 'a'.repeat(100);
      const destination = ChallengeDestination.create(longDestination);

      expect(destination.value).toBe(longDestination);
    });

    it('should handle special characters in destination', () => {
      const specialDestination = 'user+tag@example.co.uk';
      const destination = ChallengeDestination.create(specialDestination);

      expect(destination.value).toBe(specialDestination);
    });
  });

  describe('value', () => {
    it('should return the destination value', () => {
      const destination = ChallengeDestination.create('user@example.com');

      expect(destination.value).toBe('user@example.com');
    });
  });
});
