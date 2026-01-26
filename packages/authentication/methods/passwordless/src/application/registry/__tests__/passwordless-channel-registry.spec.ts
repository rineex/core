import { beforeEach, describe, expect, it } from 'vitest';

import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChannel,
} from '@/domain';
import { PasswordlessChannelPort } from '@/ports';

import { PasswordlessChannelRegistry } from '../passwordless-channel-registry';

describe('passwordlessChannelRegistry', () => {
  let mockEmailChannel: PasswordlessChannelPort;
  let mockSmsChannel: PasswordlessChannelPort;

  beforeEach(() => {
    mockEmailChannel = {
      channelName: PasswordlessChannel.create('email'),
      deliver: async () => {},
    };

    mockSmsChannel = {
      channelName: PasswordlessChannel.create('sms'),
      deliver: async () => {},
    };
  });

  describe('init', () => {
    it('should initialize registry with a channel implementation', () => {
      expect(() =>
        PasswordlessChannelRegistry.init([mockEmailChannel]),
      ).not.toThrow();
    });

    it('should allow initializing with multiple channels', () => {
      const registry = PasswordlessChannelRegistry.init([
        mockEmailChannel,
        mockSmsChannel,
      ]);

      expect(() => registry.resolve('email')).not.toThrow();
      expect(() => registry.resolve('sms')).not.toThrow();
    });

    it('should throw error when duplicate channels are registered', () => {
      const duplicateChannel: PasswordlessChannelPort = {
        channelName: PasswordlessChannel.create('email'),
        deliver: async () => {},
      };

      expect(() =>
        PasswordlessChannelRegistry.init([mockEmailChannel, duplicateChannel]),
      ).toThrow('Duplicate passwordless channel registered: email');
    });
  });

  describe('resolve', () => {
    it('should retrieve a registered channel', () => {
      const registry = PasswordlessChannelRegistry.init([mockEmailChannel]);

      const retrieved = registry.resolve('email');

      expect(retrieved).toBe(mockEmailChannel);
      expect(retrieved.channelName.value).toBe('email');
    });

    it('should throw error when channel is not registered', () => {
      const registry = PasswordlessChannelRegistry.init([]);

      expect(() => {
        registry.resolve('email');
      }).toThrow('Passwordless channel not registered: email');
    });

    it('should throw error with correct channel name in message', () => {
      const registry = PasswordlessChannelRegistry.init([mockEmailChannel]);

      expect(() => {
        registry.resolve('sms');
      }).toThrow('Passwordless channel not registered: sms');
    });

    it('should retrieve correct channel for different channel types', () => {
      const registry = PasswordlessChannelRegistry.init([
        mockEmailChannel,
        mockSmsChannel,
      ]);

      const emailChannel = registry.resolve('email');
      const smsChannel = registry.resolve('sms');

      expect(emailChannel.channelName.value).toBe('email');
      expect(smsChannel.channelName.value).toBe('sms');
      expect(emailChannel).toBe(mockEmailChannel);
      expect(smsChannel).toBe(mockSmsChannel);
    });
  });

  describe('supports', () => {
    it('should return true for registered channel', () => {
      const registry = PasswordlessChannelRegistry.init([mockEmailChannel]);

      expect(registry.supports(PasswordlessChannel.create('email'))).toBe(true);
    });

    it('should return false for unregistered channel', () => {
      const registry = PasswordlessChannelRegistry.init([mockEmailChannel]);

      expect(registry.supports(PasswordlessChannel.create('sms'))).toBe(false);
    });
  });

  describe('integration', () => {
    it('should handle complete flow: init -> resolve -> use', async () => {
      const deliveredDestination: ChallengeDestination[] = [];
      const deliveredSecret: ChallengeSecret[] = [];

      const testChannel: PasswordlessChannelPort = {
        deliver: async (destination, secret) => {
          deliveredDestination.push(destination);
          deliveredSecret.push(secret);
        },
        channelName: PasswordlessChannel.create('email'),
      };

      const registry = PasswordlessChannelRegistry.init([testChannel]);
      const retrieved = registry.resolve('email');

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
