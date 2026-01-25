import { ApplicationServicePort, ClockPort, Result } from '@rineex/ddd';
import { PasswordlessChannelRegistry } from '../registry/passwordless-channel-registry';
import { ChallengeDestination } from '@/domain/value-objects/challenge-destination.vo';
import { PasswordlessChallenge } from '@/domain/aggregates/passwordless-challenge.aggregate';
import { PasswordlessChallengeRepository } from '@/ports/repositories/passwordless-challenge.repository';
import { PasswordlessChallengeId } from '@/domain/value-objects/passwordless-challenge-id.vo';
import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';

type Input = {
  channel: PasswordlessChannel;
  destination: ChallengeDestination;
};
type Output = Result<void, any>;

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
    const handler = this.registry.get(channel);
    const secret = handler.generateSecret();

    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const challenge = PasswordlessChallenge.issue({
      id: PasswordlessChallengeId.generate(),

      props: {
        secret,
        channel,
        destination,
        expiresAt,
        issuedAt: now,
      },
    });

    await this.repository.save(challenge);
    await handler.deliver(destination, secret);

    return Result.ok(undefined);
  }
}
