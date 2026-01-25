import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';
import { PasswordlessChannelPort } from '@/ports/channels/passwordless-channel.port';

/**
 * Runtime registry for passwordless channel implementations.
 *
 * Enables open/closed extensibility.
 */
export class PasswordlessChannelRegistry {
  private readonly channels = new Map<
    PasswordlessChannel,
    PasswordlessChannelPort
  >();

  register(channel: PasswordlessChannelPort): void {
    this.channels.set(channel.channelName, channel);
  }

  get(channelName: PasswordlessChannel): PasswordlessChannelPort {
    const channel = this.channels.get(channelName);
    if (!channel) {
      throw new Error(`Passwordless channel not registered: ${channelName}`);
    }
    return channel;
  }
}
