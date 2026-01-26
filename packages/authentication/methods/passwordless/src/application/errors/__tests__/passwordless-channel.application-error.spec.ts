import { describe, expect, it } from 'vitest';

import {
  DuplicatePasswordlessChannelApplicationError,
  UnSupportedPasswordlessChannelApplicationError,
} from '../passwordless-channel.application-error';

describe('passwordlessChannelApplicationError', () => {
  describe('unSupportedPasswordlessChannelApplicationError', () => {
    describe('create', () => {
      it('should create an error with message and metadata', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Passwordless channel not registered: email',
          { key: 'email' },
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(
          UnSupportedPasswordlessChannelApplicationError,
        );
        expect(error.message).toBe(
          'Passwordless channel not registered: email',
        );
        expect(error.metadata).toEqual({ key: 'email' });
      });

      it('should have correct error code', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.code).toBe(
          'un_supported_passwordless_channel_application_error',
        );
      });

      it('should be marked as operational', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.isOperational).toBe(true);
      });

      it('should have correct error name', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.name).toBe(
          'UnSupportedPasswordlessChannelApplicationError',
        );
      });

      it('should capture stack trace', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain(
          'UnSupportedPasswordlessChannelApplicationError',
        );
      });

      it('should handle metadata without key', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.metadata).toEqual({});
      });

      it('should handle empty message', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          '',
          {
            key: 'test',
          },
        );

        expect(error.message).toBe('');
        expect(error.metadata).toEqual({ key: 'test' });
      });
    });

    describe('error properties', () => {
      it('should preserve all metadata fields', () => {
        const error = UnSupportedPasswordlessChannelApplicationError.create(
          'Channel not found',
          { key: 'whatsapp' },
        );

        expect(error.metadata?.key).toBe('whatsapp');
      });

      it('should allow multiple error instances with different messages', () => {
        const error1 = UnSupportedPasswordlessChannelApplicationError.create(
          'Channel email not found',
          { key: 'email' },
        );
        const error2 = UnSupportedPasswordlessChannelApplicationError.create(
          'Channel sms not found',
          { key: 'sms' },
        );

        expect(error1.message).toBe('Channel email not found');
        expect(error2.message).toBe('Channel sms not found');
        expect(error1.metadata?.key).toBe('email');
        expect(error2.metadata?.key).toBe('sms');
      });
    });
  });

  describe('duplicatePasswordlessChannelApplicationError', () => {
    describe('create', () => {
      it('should create an error with message and metadata', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Duplicate passwordless channel registered: email',
          { key: 'email' },
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(
          DuplicatePasswordlessChannelApplicationError,
        );
        expect(error.message).toBe(
          'Duplicate passwordless channel registered: email',
        );
        expect(error.metadata).toEqual({ key: 'email' });
      });

      it('should have correct error code', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.code).toBe(
          'duplicate_passwordless_channel_application_error',
        );
      });

      it('should be marked as operational', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.isOperational).toBe(true);
      });

      it('should have correct error name', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.name).toBe('DuplicatePasswordlessChannelApplicationError');
      });

      it('should capture stack trace', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain(
          'DuplicatePasswordlessChannelApplicationError',
        );
      });

      it('should handle metadata without key', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Test message',
          {},
        );

        expect(error.metadata).toEqual({});
      });

      it('should handle empty message', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create('', {
          key: 'test',
        });

        expect(error.message).toBe('');
        expect(error.metadata).toEqual({ key: 'test' });
      });
    });

    describe('error properties', () => {
      it('should preserve all metadata fields', () => {
        const error = DuplicatePasswordlessChannelApplicationError.create(
          'Duplicate channel',
          { key: 'sms' },
        );

        expect(error.metadata?.key).toBe('sms');
      });

      it('should allow multiple error instances with different messages', () => {
        const error1 = DuplicatePasswordlessChannelApplicationError.create(
          'Duplicate channel email',
          { key: 'email' },
        );
        const error2 = DuplicatePasswordlessChannelApplicationError.create(
          'Duplicate channel sms',
          { key: 'sms' },
        );

        expect(error1.message).toBe('Duplicate channel email');
        expect(error2.message).toBe('Duplicate channel sms');
        expect(error1.metadata?.key).toBe('email');
        expect(error2.metadata?.key).toBe('sms');
      });
    });
  });

  describe('error type differentiation', () => {
    it('should allow instanceof checks to differentiate error types', () => {
      const unsupportedError =
        UnSupportedPasswordlessChannelApplicationError.create('Not found', {
          key: 'email',
        });
      const duplicateError =
        DuplicatePasswordlessChannelApplicationError.create('Duplicate', {
          key: 'email',
        });

      expect(unsupportedError).toBeInstanceOf(
        UnSupportedPasswordlessChannelApplicationError,
      );
      expect(unsupportedError).not.toBeInstanceOf(
        DuplicatePasswordlessChannelApplicationError,
      );

      expect(duplicateError).toBeInstanceOf(
        DuplicatePasswordlessChannelApplicationError,
      );
      expect(duplicateError).not.toBeInstanceOf(
        UnSupportedPasswordlessChannelApplicationError,
      );
    });

    it('should have different error codes', () => {
      const unsupportedError =
        UnSupportedPasswordlessChannelApplicationError.create('Test', {});
      const duplicateError =
        DuplicatePasswordlessChannelApplicationError.create('Test', {});

      expect(unsupportedError.code).not.toBe(duplicateError.code);
      expect(unsupportedError.code).toBe(
        'un_supported_passwordless_channel_application_error',
      );
      expect(duplicateError.code).toBe(
        'duplicate_passwordless_channel_application_error',
      );
    });
  });
});
