import { PasswordlessChannelPort } from '@/ports';
import { PasswordlessChannel } from '@/domain';

import {
  DuplicatePasswordlessChannelApplicationError,
  UnSupportedPasswordlessChannelApplicationError,
} from '../errors';

/**
 * Runtime registry for passwordless channel implementations.
 *
 * Enables open/closed extensibility: new channels can be registered at startup
 * without modifying core code. Channels are keyed by {@link PasswordlessChannel}
 * name and looked up when resolving or checking support.
 */
export class PasswordlessChannelRegistry {
  /** Map of channel name to port implementation. */
  private readonly channels: Map<string, PasswordlessChannelPort>;

  /**
   * Creates a registry with the given channel implementations.
   *
   * @param channels - Initial set of passwordless channel ports to register
   * @internal
   */
  private constructor(channels: readonly PasswordlessChannelPort[]) {
    this.channels = PasswordlessChannelRegistry.build(channels);
  }

  /**
   * Initializes the registry with the given passwordless channel implementations.
   *
   * @param channels - Passwordless channel ports to register
   * @returns A new {@link PasswordlessChannelRegistry} instance
   * @throws {DuplicatePasswordlessChannelApplicationError} When the same channel name is registered more than once
   */
  public static init(
    channels: readonly PasswordlessChannelPort[],
  ): PasswordlessChannelRegistry {
    return new PasswordlessChannelRegistry(channels);
  }

  /**
   * Builds an immutable map from channel names to their port implementations.
   *
   * @param channels - Channel ports to index
   * @returns Map keyed by channel name
   * @throws {DuplicatePasswordlessChannelApplicationError} When a duplicate channel name is encountered
   * @internal
   */
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

  /**
   * Derives the registry key for a channel from its port.
   *
   * @param channel - The passwordless channel port
   * @returns The channel name used as the registry key
   * @internal
   */
  private static channelKey(channel: PasswordlessChannelPort): string {
    return channel.channelName.value;
  }

  /**
   * Retrieves a registered passwordless channel implementation by name.
   *
   * @param key - The channel name (e.g. from {@link PasswordlessChannel.value})
   * @returns The registered channel port implementation
   * @throws {UnSupportedPasswordlessChannelApplicationError} When no channel is registered for the given key
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
   * Checks whether a given passwordless channel is supported by this registry.
   *
   * Useful for policy decisions before issuing challenges (e.g. UI or routing).
   *
   * @param channel - The passwordless channel to check
   * @returns `true` if the channel is registered, otherwise `false`
   */
  public supports(channel: PasswordlessChannel): boolean {
    return this.channels.has(channel.value);
  }
}
