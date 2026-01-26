import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChannel,
} from '@/domain/value-objects';
import { PasswordlessChannelPort } from '@/ports';

export class EmailChannel implements PasswordlessChannelPort {
  public readonly channelName = PasswordlessChannel.create('email');

  deliver(
    destination: ChallengeDestination,
    secret: ChallengeSecret,
  ): Promise<void> {
    throw new Error('not implemented yet');
  }
}
