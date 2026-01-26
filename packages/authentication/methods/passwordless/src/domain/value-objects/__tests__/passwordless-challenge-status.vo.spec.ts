import { describe, expect, it } from 'vitest';

import { PasswordlessChallengeStatus } from '..';

describe('passwordlessChallengeStatus', () => {
  describe('static factory methods', () => {
    it('should create expired status', () => {
      const status = PasswordlessChallengeStatus.expired();

      expect(status).toBeInstanceOf(PasswordlessChallengeStatus);
      expect(status.value).toBe('expired');
    });

    it('should create issued status', () => {
      const status = PasswordlessChallengeStatus.issued();

      expect(status).toBeInstanceOf(PasswordlessChallengeStatus);
      expect(status.value).toBe('issued');
    });

    it('should create verified status', () => {
      const status = PasswordlessChallengeStatus.verified();

      expect(status).toBeInstanceOf(PasswordlessChallengeStatus);
      expect(status.value).toBe('verified');
    });
  });

  describe('isFinal', () => {
    it('should return true for verified status', () => {
      const status = PasswordlessChallengeStatus.verified();

      expect(status.isFinal()).toBe(true);
    });

    it('should return true for expired status', () => {
      const status = PasswordlessChallengeStatus.expired();

      expect(status.isFinal()).toBe(true);
    });

    it('should return false for issued status', () => {
      const status = PasswordlessChallengeStatus.issued();

      expect(status.isFinal()).toBe(false);
    });
  });

  describe('value', () => {
    it('should return the status value', () => {
      const issued = PasswordlessChallengeStatus.issued();
      const verified = PasswordlessChallengeStatus.verified();
      const expired = PasswordlessChallengeStatus.expired();

      expect(issued.value).toBe('issued');
      expect(verified.value).toBe('verified');
      expect(expired.value).toBe('expired');
    });
  });

  describe('status transitions', () => {
    it('should allow issued -> verified transition', () => {
      const issued = PasswordlessChallengeStatus.issued();
      const verified = PasswordlessChallengeStatus.verified();

      expect(issued.isFinal()).toBe(false);
      expect(verified.isFinal()).toBe(true);
    });

    it('should allow issued -> expired transition', () => {
      const issued = PasswordlessChallengeStatus.issued();
      const expired = PasswordlessChallengeStatus.expired();

      expect(issued.isFinal()).toBe(false);
      expect(expired.isFinal()).toBe(true);
    });

    it('should not allow verified -> issued transition (final state)', () => {
      const verified = PasswordlessChallengeStatus.verified();

      expect(verified.isFinal()).toBe(true);
    });

    it('should not allow expired -> issued transition (final state)', () => {
      const expired = PasswordlessChallengeStatus.expired();

      expect(expired.isFinal()).toBe(true);
    });
  });

  describe('equality', () => {
    it('should create equal status instances for same value', () => {
      const status1 = PasswordlessChallengeStatus.issued();
      const status2 = PasswordlessChallengeStatus.issued();

      expect(status1.value).toBe(status2.value);
    });

    it('should create different status instances for different values', () => {
      const issued = PasswordlessChallengeStatus.issued();
      const verified = PasswordlessChallengeStatus.verified();

      expect(issued.value).not.toBe(verified.value);
    });
  });
});
