import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChannel,
} from '@/domain/value-objects';
import { PasswordlessChannelPort } from '@/ports';

export class SMSChannelImp implements PasswordlessChannelPort {
  public readonly channelName = PasswordlessChannel.create('sms');

  deliver(
    destination: ChallengeDestination,
    secret: ChallengeSecret,
  ): Promise<void> {
    throw new Error('not implemented yet');
  }
}
