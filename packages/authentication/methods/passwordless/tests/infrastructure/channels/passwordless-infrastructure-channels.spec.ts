import { describe, expect, it } from 'vitest';

import { ChallengeDestination, ChallengeSecret } from '@/domain';

import { EmailChannel } from '@/infrastructure/channels/email.channel';
import { SMSChannelImp } from '@/infrastructure/channels/sms.channel';

describe('passwordless infrastructure channels', () => {
  describe('EmailChannel', () => {
    it('should expose channelName as email', () => {
      const channel = new EmailChannel();
      expect(channel.channelName.value).toBe('email');
    });

    it('deliver should throw not implemented yet', () => {
      const channel = new EmailChannel();
      const destination = ChallengeDestination.create('user@example.com');
      const secret = ChallengeSecret.create('123456');

      expect(() => channel.deliver(destination, secret)).toThrow(
        'not implemented yet',
      );
    });
  });

  describe('SMSChannelImp', () => {
    it('should expose channelName as sms', () => {
      const channel = new SMSChannelImp();
      expect(channel.channelName.value).toBe('sms');
    });

    it('deliver should throw not implemented yet', () => {
      const channel = new SMSChannelImp();
      const destination = ChallengeDestination.create('+1234567890');
      const secret = ChallengeSecret.create('123456');

      expect(() => channel.deliver(destination, secret)).toThrow(
        'not implemented yet',
      );
    });
  });
});

