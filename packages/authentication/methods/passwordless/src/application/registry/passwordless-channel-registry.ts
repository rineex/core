import { PasswordlessChannelPort } from '@/ports/channels/passwordless-channel.port';
import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';

import {
  DuplicatePasswordlessChannelApplicationError,
  UnSupportedPasswordlessChannelApplicationError,
} from '../errors/passwordless-channel.application-error';

/**
 * Runtime registry for passwordless channel implementations.
 *
 * Enables open/closed extensibility.
 */
export class PasswordlessChannelRegistry {
  private readonly channels: Map<string, PasswordlessChannelPort>;

  private constructor(channels: readonly PasswordlessChannelPort[]) {
    this.channels = PasswordlessChannelRegistry.build(channels);
  }

  public static init(
    channels: readonly PasswordlessChannelPort[],
  ): PasswordlessChannelRegistry {
    return new PasswordlessChannelRegistry(channels);
  }

  private static build(
    channels: readonly PasswordlessChannelPort[],
  ): Map<string, PasswordlessChannelPort> {
    const map = new Map<string, PasswordlessChannelPort>();

    for (const channel of channels) {
      const key = PasswordlessChannelRegistry.channelKey(channel);

      if (map.has(key)) {
        throw DuplicatePasswordlessChannelApplicationError.create(
          `Duplicate passwordless channel registered: ${key}`,
          { key },
        );
      }

      map.set(key, channel);
    }
    return map;
  }

  private static channelKey(channel: PasswordlessChannelPort): string {
    return channel.channelName.value;
  }

  /**
   * Retrieves a registered passwordless channel implementation.
   *
   * @param {PasswordlessChannel} key - The name of the channel to retrieve
   * @returns {PasswordlessChannelPort} The registered channel implementation
   * @throws {Error} If the channel is not registered
   */
  resolve(key: string): PasswordlessChannelPort {
    const channel = this.channels.get(key);
    if (!channel) {
      throw UnSupportedPasswordlessChannelApplicationError.create(
        `Passwordless channel not registered: ${key}`,
        { key },
      );
    }
    return channel;
  }

  /**
   * Checks whether a channel is supported.
   *
   * Useful for policy decisions before issuing challenges.
   */
  public supports(channel: PasswordlessChannel): boolean {
    return this.channels.has(channel.value);
  }
}
