import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChannel,
} from '@/domain';

/**
 * Port interface for passwordless channel implementations.
 *
 * This port defines the contract for delivering passwordless challenges
 * through various channels (email, SMS, push notifications, etc.).
 * Each channel implementation is a plug-in that implements this interface.
 *
 * @example
 * ```typescript
 * const emailChannel: PasswordlessChannelPort = {
 *   channelName: PasswordlessChannel.create('email'),
 *   deliver: async (destination, secret) => {
 *     await emailService.send(destination.value, secret.value);
 *   },
 * };
 * ```
 */
export type PasswordlessChannelPort = {
  /**
   * The name of the channel this port implements.
   */
  readonly channelName: PasswordlessChannel;

  /**
   * Delivers the challenge secret to the specified destination.
   *
   * @param {ChallengeDestination} destination - Where to deliver the challenge
   * @param {ChallengeSecret} secret - The secret to deliver
   * @returns {Promise<void>} Promise that resolves when delivery is complete
   */
  deliver: (
    destination: ChallengeDestination,
    secret: ChallengeSecret,
  ) => Promise<void>;
};
