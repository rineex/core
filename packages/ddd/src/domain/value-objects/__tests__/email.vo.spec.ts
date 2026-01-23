import { describe, expect, it } from 'vitest';

import { Email } from '../email.vo';

describe('email', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');

      expect(email.value).toBe('test@example.com');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        '123@example.com',
      ];

      validEmails.forEach(emailStr => {
        expect(() => {
          // eslint-disable-next-line no-new
          new Email(emailStr);
        }).not.toThrow();
      });
    });

    it('should throw InvalidValueObjectError for invalid email', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@example',
        'user space@example.com',
        '',
      ];

      invalidEmails.forEach(emailStr => {
        expect(() => {
          // eslint-disable-next-line no-new
          new Email(emailStr);
          // eslint-disable-next-line vitest/require-to-throw-message
        }).toThrow();
      });
    });
  });

  describe('fromString', () => {
    it('should create email from string', () => {
      const email = Email.fromString('test@example.com');

      expect(email).toBeInstanceOf(Email);
      expect(email.value).toBe('test@example.com');
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        Email.fromString('invalid-email');
        // eslint-disable-next-line vitest/require-to-throw-message
      }).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email string', () => {
      const email = new Email('test@example.com');

      expect(email.toString()).toBe('test@example.com');
    });
  });
});
