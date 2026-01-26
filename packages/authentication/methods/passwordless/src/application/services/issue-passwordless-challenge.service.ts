import { ApplicationServicePort, ClockPort, Result } from '@rineex/ddd';

import ms from 'ms';

import {
  ChallengeDestination,
  ChallengeSecret,
  PasswordlessChallengeAggregate,
  PasswordlessChallengeStatus,
  PasswordlessChannel,
} from '@/domain';
import {
  PasswordlessChallengeRepository,
  PasswordlessIdGeneratorPort,
} from '@/ports';

type Input = {
  channel: PasswordlessChannel;
  destination: ChallengeDestination;
  secret: ChallengeSecret;
  /**
   * optional, default 300
   */
  ttlSeconds?: ms.StringValue;
};
type Output = Result<PasswordlessChallengeAggregate, any>;

/**
 * Application Service responsible for issuing passwordless challenges.
 *
 * Responsibilities:
 * - Create new PasswordlessChallengeAggregate
 * - Persist via repository port
 * - Generate new ID and timestamp via ports
 * - Returns Result<PasswordlessChallengeAggregate, DomainViolation>
 */
export class IssuePasswordlessChallengeService implements ApplicationServicePort<
  Input,
  Output
> {
  constructor(
    private readonly repository: PasswordlessChallengeRepository,
    private readonly idGenerator: PasswordlessIdGeneratorPort,
    private readonly clock: ClockPort,
  ) {}

  async execute({
    ttlSeconds = '300s',
    destination,
    channel,
    secret,
  }: Input): Promise<Output> {
    try {
      const id = this.idGenerator.generate();
      const now = this.clock.now();

      const challenge = PasswordlessChallengeAggregate.issue({
        props: {
          expiresAt: new Date(now.getTime() + ms(ttlSeconds)),
          status: PasswordlessChallengeStatus.issued(),
          issuedAt: now,
          destination,

          channel,
          secret,
        },
        id,
      });

      await this.repository.save(challenge);
      return Result.ok(challenge);
    } catch (error) {
      return Result.fail(error);
    }
  }
}
