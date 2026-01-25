import { InvalidValueObjectError } from '@rineex/ddd';

import { describe, expect, it } from 'vitest';

import { PasswordlessChannel, PasswordlessChannelType } from '../channel.vo';

describe('passwordlessChannel', () => {
  describe('create', () => {
    it('should create a valid email channel', () => {
      const channel = PasswordlessChannel.create('email');

      expect(channel).toBeInstanceOf(PasswordlessChannel);
      expect(channel.value).toBe('email');
    });

    it('should create a valid SMS channel', () => {
      const channel = PasswordlessChannel.create('sms');

      expect(channel).toBeInstanceOf(PasswordlessChannel);
      expect(channel.value).toBe('sms');
    });

    it('should create a valid authenticator_app channel', () => {
      const channel = PasswordlessChannel.create('authenticator_app');

      expect(channel).toBeInstanceOf(PasswordlessChannel);
      expect(channel.value).toBe('authenticator_app');
    });

    it('should create a valid push channel', () => {
      const channel = PasswordlessChannel.create('push');

      expect(channel).toBeInstanceOf(PasswordlessChannel);
      expect(channel.value).toBe('push');
    });

    it('should throw InvalidValueObjectError for invalid channel', () => {
      expect(() => {
        PasswordlessChannel.create('invalid' as PasswordlessChannelType);
      }).toThrow(InvalidValueObjectError);
    });

    it('should throw InvalidValueObjectError for empty string', () => {
      expect(() => {
        PasswordlessChannel.create('' as PasswordlessChannelType);
      }).toThrow(InvalidValueObjectError);
    });

    it('should throw error with correct message including invalid value', () => {
      expect(() => {
        PasswordlessChannel.create('telegram' as PasswordlessChannelType);
      }).toThrow(/Invalid passwordless channel: telegram/);
    });
  });

  describe('value', () => {
    it('should return the channel value', () => {
      const channel = PasswordlessChannel.create('email');

      expect(channel.value).toBe('email');
    });
  });

  describe('allowed channels', () => {
    it('should accept all allowed channel types', () => {
      const channels = ['email', 'sms', 'authenticator_app', 'push'] as const;

      channels.forEach(channelType => {
        const channel = PasswordlessChannel.create(channelType);

        expect(channel.value).toBe(channelType);
      });
    });
  });
});
