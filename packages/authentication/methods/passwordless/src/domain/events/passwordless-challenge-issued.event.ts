import { CreateEventProps, DomainEvent, EntityId } from '@rineex/ddd';

type EventProps = {
  channel: string;
  destination: string;
  expiresAt: string;
};

export class PasswordlessChallengeIssuedEvent extends DomainEvent<EventProps> {
  public readonly eventName = 'auth.passwordless.challenge_created';

  public static create(
    props: CreateEventProps<EventProps>,
  ): PasswordlessChallengeIssuedEvent {
    return new PasswordlessChallengeIssuedEvent(props);
  }
}
