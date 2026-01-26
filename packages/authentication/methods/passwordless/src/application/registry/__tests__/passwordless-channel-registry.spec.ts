import { beforeEach, describe, expect, it } from 'vitest';

import { ChallengeDestination } from '@/domain/value-objects/challenge-destination.vo';
import { PasswordlessChannelPort } from '@/ports/channels/passwordless-channel.port';
import { ChallengeSecret } from '@/domain/value-objects/challenge-secret.vo';
import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';

import { PasswordlessChannelRegistry } from '../passwordless-channel-registry';

describe('passwordlessChannelRegistry', () => {
  let registry: PasswordlessChannelRegistry;
  let mockEmailChannel: PasswordlessChannelPort;
  let mockSmsChannel: PasswordlessChannelPort;

  beforeEach(() => {
    registry = new PasswordlessChannelRegistry();

    mockEmailChannel = {
      channelName: PasswordlessChannel.create('email'),
      deliver: async () => {},
    };

    mockSmsChannel = {
      channelName: PasswordlessChannel.create('sms'),
      deliver: async () => {},
    };
  });

  describe('register', () => {
    it('should register a channel implementation', () => {
      expect(() => registry.register(mockEmailChannel)).not.toThrow();
    });

    it('should allow registering multiple channels', () => {
      registry.register(mockEmailChannel);
      registry.register(mockSmsChannel);

      expect(() =>
        registry.resolve(PasswordlessChannel.create('email')),
      ).not.toThrow();
      expect(() =>
        registry.resolve(PasswordlessChannel.create('sms')),
      ).not.toThrow();
    });

    it('should overwrite existing channel registration', () => {
      const firstChannel: PasswordlessChannelPort = {
        channelName: PasswordlessChannel.create('email'),
        deliver: async () => {},
      };

      const secondChannel: PasswordlessChannelPort = {
        channelName: PasswordlessChannel.create('email'),
        deliver: async () => {},
      };

      registry.register(firstChannel);
      registry.register(secondChannel);

      const retrieved = registry.resolve(PasswordlessChannel.create('email'));

      expect(retrieved).toBe(secondChannel);
    });
  });

  describe('get', () => {
    it('should retrieve a registered channel', () => {
      registry.register(mockEmailChannel);

      const retrieved = registry.resolve(PasswordlessChannel.create('email'));

      expect(retrieved).toBe(mockEmailChannel);
      expect(retrieved.channelName.value).toBe('email');
    });

    it('should throw error when channel is not registered', () => {
      expect(() => {
        registry.resolve(PasswordlessChannel.create('email'));
      }).toThrow('Passwordless channel not registered: email');
    });

    it('should throw error with correct channel name in message', () => {
      registry.register(mockEmailChannel);

      expect(() => {
        registry.resolve(PasswordlessChannel.create('sms'));
      }).toThrow('Passwordless channel not registered: sms');
    });

    it('should retrieve correct channel for different channel types', () => {
      registry.register(mockEmailChannel);
      registry.register(mockSmsChannel);

      const emailChannel = registry.resolve(
        PasswordlessChannel.create('email'),
      );
      const smsChannel = registry.resolve(PasswordlessChannel.create('sms'));

      expect(emailChannel.channelName.value).toBe('email');
      expect(smsChannel.channelName.value).toBe('sms');
      expect(emailChannel).toBe(mockEmailChannel);
      expect(smsChannel).toBe(mockSmsChannel);
    });
  });

  describe('integration', () => {
    it('should handle complete flow: register -> get -> use', async () => {
      const deliveredDestination: ChallengeDestination[] = [];
      const deliveredSecret: ChallengeSecret[] = [];

      const testChannel: PasswordlessChannelPort = {
        deliver: async (destination, secret) => {
          deliveredDestination.push(destination);
          deliveredSecret.push(secret);
        },
        channelName: PasswordlessChannel.create('email'),
      };

      registry.register(testChannel);
      const retrieved = registry.resolve(PasswordlessChannel.create('email'));

      const destination = ChallengeDestination.create('user@example.com');
      const secret = ChallengeSecret.create('123456');

      await retrieved.deliver(destination, secret);

      expect(deliveredDestination).toHaveLength(1);
      expect(deliveredSecret).toHaveLength(1);
      expect(deliveredDestination[0]).toBe(destination);
      expect(deliveredSecret[0]).toBe(secret);
    });
  });
});
