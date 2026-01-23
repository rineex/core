import { ApplicationServicePort } from '@rineex/ddd';
import { PasswordlessChannelRegistry } from '../registry/passwordless-channel-registry';
import { PasswordlessChannelName } from '@/domain/value-objects/passwordless-channel-name.vo';
import { ChallengeDestination } from '@/domain/value-objects/challenge-destination.vo';
import { PasswordlessChallenge } from '@/domain/aggregates/passwordless-challenge.aggregate';

type Input = {
  channel: PasswordlessChannelName;
  destination: ChallengeDestination;
};
type Output = void;

export class IssuePasswordlessChallengeService implements ApplicationServicePort<
  Input,
  Output
> {
  constructor(
    private readonly registry: PasswordlessChannelRegistry,
    private readonly repository: PasswordlessChallengeRepository,
    private readonly clock: ClockPort,
  ) {}

  async execute({ channel, destination }: Input): Promise<Output> {
    const handler = this.registry.get(channel.value);
    const secret = handler.generateSecret();

    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const challenge = PasswordlessChallenge.issue({
      channel,
      destination: destination,
      secret,
      issuedAt: now,
      expiresAt,
    });

    await this.repository.save(challenge);
    await handler.deliver(destination, secret);
  }
}
