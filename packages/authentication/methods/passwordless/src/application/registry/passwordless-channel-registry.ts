import { PasswordlessChannelPort } from '@/ports/channels/passwordless-channel.port';
import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';

/**
 * Runtime registry for passwordless channel implementations.
 *
 * Enables open/closed extensibility.
 */
export class PasswordlessChannelRegistry {
  private readonly channels = new Map<string, PasswordlessChannelPort>();

  /**
   * Retrieves a registered passwordless channel implementation.
   *
   * @param {PasswordlessChannel} channelName - The name of the channel to retrieve
   * @returns {PasswordlessChannelPort} The registered channel implementation
   * @throws {Error} If the channel is not registered
   */
  get(channelName: PasswordlessChannel): PasswordlessChannelPort {
    const channel = this.channels.get(channelName.value);
    if (!channel) {
      throw new Error(
        `Passwordless channel not registered: ${channelName.value}`,
      );
    }
    return channel;
  }

  /**
   * Registers a passwordless channel implementation.
   *
   * @param {PasswordlessChannelPort} channel - The channel implementation to register
   */
  register(channel: PasswordlessChannelPort): void {
    this.channels.set(channel.channelName.value, channel);
  }
}
