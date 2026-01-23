import { AggregateRoot, EntityProps } from '@rineex/ddd';
import { ChallengeDestination } from '../value-objects/challenge-destination.vo';
import { ChallengeSecret } from '../value-objects/challenge-secret.vo';
import { PasswordlessChannelName } from '../value-objects/passwordless-channel-name.vo';
import { PasswordlessChallengeId } from '../value-objects/passwordless-challenge-id.vo';
import { PasswordlessChallengeIssuedEvent } from '../events/passwordless-challenge-issued.event';

type PasswordlessChallengeProps = {
  readonly channel: PasswordlessChannelName;
  readonly destination: ChallengeDestination;
  readonly secret: ChallengeSecret;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
};

export class PasswordlessChallenge extends AggregateRoot<PasswordlessChallengeProps> {
  validate(): void {
    if (this.props.expiresAt <= this.props.issuedAt) {
      throw new Error('Challenge expiration must be after issuedAt');
    }
  }

  public static issue({
    props,
    id,
    createdAt,
  }: EntityProps<PasswordlessChallengeProps>): PasswordlessChallenge {
    const challenge = new PasswordlessChallenge({ props, id, createdAt });

    challenge.addEvent(
      PasswordlessChallengeIssuedEvent.create({
        aggregateId: challenge.id,
        occurredAt: props.issuedAt.getTime(),
        schemaVersion: 1,
        payload: {
          channel: challenge.props.channel.value,
          destination: challenge.props.destination.value,
          expiresAt: challenge.props.expiresAt.toISOString(),
        },
      }),
    );

    return challenge;
  }

  isExpired(now = new Date()): boolean {
    return now > this.props.expiresAt;
  }

  matchesSecret(input: string): boolean {
    return this.props.secret.value === input;
  }

  toObject() {
    return {
      channel: this.props.channel.value,
      destination: this.props.destination.value,
      issuedAt: this.props.issuedAt.toISOString(),
      expired: this.isExpired(),
    };
  }
}
