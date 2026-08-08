import { describe, expect, it } from 'vitest';

import { InvalidValueObjectError } from '@/domain/errors/invalid-vo.error';

import { Email } from '../email.vo';

describe('email ValueObject', () => {
  const validEmail = 'test@example.com';
  const invalidEmail = 'not-an-email';

  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email(validEmail);

      expect(email.value).toBe(validEmail);
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
          // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        }).toThrow(InvalidValueObjectError);
        expect(() => {
          // eslint-disable-next-line no-new
          new Email(emailStr);
        }).toThrow(`Invalid Email: ${emailStr}`);
      });
    });

    it('should include the invalid value in error metadata', () => {
      try {
        // eslint-disable-next-line no-new
        new Email(invalidEmail);

        expect.fail('Expected InvalidValueObjectError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidValueObjectError);
        expect((error as InvalidValueObjectError).metadata).toEqual({
          value: invalidEmail,
        });
      }
    });
  });

  describe('fromString', () => {
    it('should create email from string', () => {
      const email = Email.fromString(validEmail);

      expect(email).toBeInstanceOf(Email);
      expect(email.value).toBe(validEmail);
    });

    it('should throw InvalidValueObjectError for invalid email', () => {
      expect(() => Email.fromString(invalidEmail)).toThrow(
        // @ts-expect-error - Cannot assign a 'protected' constructor type to a 'public' constructor
        InvalidValueObjectError,
      );
      expect(() => Email.fromString(invalidEmail)).toThrow(
        `Invalid Email: ${invalidEmail}`,
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email(validEmail);
      const email2 = new Email(validEmail);

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email(validEmail);
      const email2 = new Email('other@example.com');

      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      const email = new Email(validEmail);

      expect(email.equals(null)).toBe(false);
      expect(email.equals(undefined)).toBe(false);
    });

    it('should return false for non-Email values', () => {
      const email = new Email(validEmail);

      expect(email.equals({ value: validEmail })).toBe(false);
      expect(email.equals(validEmail)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the email string', () => {
      const email = new Email(validEmail);

      expect(email.value).toBe(validEmail);
    });
  });

  describe('lowercase', () => {
    it('should normalize the email string to lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');

      expect(email.value).toBe('test@example.com');
    });

    it('should treat differently cased emails as equal', () => {
      const email1 = new Email('TEST@EXAMPLE.COM');
      const email2 = new Email('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return email string', () => {
      const email = new Email(validEmail);

      expect(email.toString()).toBe(validEmail);
    });
  });
});
