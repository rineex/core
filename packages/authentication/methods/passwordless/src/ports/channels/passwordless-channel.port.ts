import { ChallengeDestination } from '@/domain/value-objects/challenge-destination.vo';
import { ChallengeSecret } from '@/domain/value-objects/challenge-secret.vo';
import { PasswordlessChannelNameLiteral } from '@/domain/value-objects/passwordless-channel-name.vo';

/**
 * Strategy interface for passwordless channels.
 *
 * Each channel implementation is a plug-in.
 */
export type PasswordlessChannelPort = {
  readonly channelName: PasswordlessChannelNameLiteral;

  /**
   * Generates a challenge secret.
   */
  generateSecret(): ChallengeSecret;

  /**
   * Delivers the challenge to the destination.
   */
  deliver(
    destination: ChallengeDestination,
    secret: ChallengeSecret,
  ): Promise<void>;
};
