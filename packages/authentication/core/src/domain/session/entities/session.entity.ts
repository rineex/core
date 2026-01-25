import { Entity, EntityProps } from '@rineex/ddd';

import { SessionToken } from '@/domain/token/value-objects/session-token.vo';
import { IdentityId } from '@/domain/identity';

import { SessionId } from '../value-objects/session-id.vo';

interface SessionProps {
  readonly identityId: IdentityId;
  readonly token: SessionToken;
  readonly expiresAt: Date;
  readonly revokedAt?: Date;
}

type CreateSessionProps = EntityProps<SessionId, SessionProps>;

export class Session extends Entity<SessionId, SessionProps> {
  protected constructor(props: CreateSessionProps) {
    super(props);
  }

  public static create(props: CreateSessionProps): Session {
    return new Session(props);
  }

  public isActive(now = new Date()): boolean {
    if (!this.props.expiresAt) return false;

    return now < this.props.expiresAt;
  }

  revoke(at: Date): void {
    if (this.props.revokedAt) return;

    this.mutate(current => ({ ...current, revokedAt: at }));
  }

  toObject(): Record<string, unknown> {
    return {
      identityId: this.props.identityId.getValue(),
      revokedAt: this.props.revokedAt?.toString(),
      expiresAt: this.props.expiresAt.toString(),
      revoked: !!this.props.revokedAt,
      token: this.props.token,
      id: this.id.getValue(),
    };
  }

  validate(): void {
    if (this.props.expiresAt <= new Date(0)) {
      throw new Error('Session expiration must be valid');
    }
  }
}
