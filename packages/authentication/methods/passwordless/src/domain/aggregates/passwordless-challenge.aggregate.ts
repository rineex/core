import { AggregateRoot, EntityProps } from '@rineex/ddd';
import { ChallengeDestination } from '../value-objects/challenge-destination.vo';
import { ChallengeSecret } from '../value-objects/challenge-secret.vo';
import { PasswordlessChallengeId } from '../value-objects/passwordless-challenge-id.vo';
import { PasswordlessChallengeIssuedEvent } from '../events/passwordless-challenge-issued.event';
import { PasswordlessChannel } from '../value-objects/channel.vo';

type PasswordlessChallengeProps = {
  readonly channel: PasswordlessChannel;
  readonly destination: ChallengeDestination;
  readonly secret: ChallengeSecret;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
};

type CreatePasswordlessProps = EntityProps<
  PasswordlessChallengeId,
  PasswordlessChallengeProps
>;

export class PasswordlessChallenge extends AggregateRoot<
  PasswordlessChallengeId,
  PasswordlessChallengeProps
> {
  validate(): void {
    if (this.props.expiresAt <= this.props.issuedAt) {
      throw new Error('Challenge expiration must be after issuedAt');
    }
  }

  public static issue({
    props,
    id,
    createdAt,
  }: CreatePasswordlessProps): PasswordlessChallenge {
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
