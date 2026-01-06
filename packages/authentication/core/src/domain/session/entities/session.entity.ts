import { SessionToken } from '@/domain/token/value-objects/session-token.vo';
import { defaultIfNilOrEmpty } from '@/utils/default-if-blank.util';
import { CreateEntityProps, Entity } from '@rineex/ddd';
import { IdentityId } from '@/domain/identity';

import { SessionId } from '../value-objects/session-id.vo';

interface CreateSessionProps extends CreateEntityProps<SessionId> {
  readonly identityId: IdentityId;
  readonly token: SessionToken;
  readonly expiresAt: Date;
  readonly revokedAt?: Date;
}

export class Session extends Entity<SessionId> {
  private _identityId: IdentityId;
  private _token: SessionToken;
  private _expiresAt: Date;
  private _revokedAt?: Date;

  protected constructor({ createdAt, id, ...props }: CreateSessionProps) {
    super({ createdAt, id });

    this._expiresAt = props.expiresAt;
    this._revokedAt = props.revokedAt;
    this._identityId = props.identityId;
    this._token = props.token;
  }

  public static create(props: CreateSessionProps): Session {
    return new Session(props);
  }

  toObject(): Record<string, unknown> {
    return {
      identityId: this._identityId.getValue(),
      revokedAt: this._revokedAt?.toString(),
      expiresAt: this._expiresAt.toString(),
      revoked: !!this._revokedAt,
      id: this.id.getValue(),
      token: this._token,
    };
  }

  revoke(at: Date): void {
    if (this._revokedAt) return;

    this.mutate(draft => {
      draft._revokedAt = at;
    });
  }

  public isActive(now = new Date()): boolean {
    if (this._revokedAt) return false;

    return now < this._expiresAt;
  }

  protected snapshot() {
    return {
      revokedAt: defaultIfNilOrEmpty(this._revokedAt?.toISOString()),
      expiresAt: this._expiresAt.toISOString(),
      identityId: this._identityId.toJSON(),
      token: this._token.toJSON(),
    };
  }

  protected restore(snapshot: Record<string, unknown>): void {
    this._revokedAt = snapshot?.revokedAt
      ? new Date(snapshot.revokedAt as string)
      : undefined;
    this._expiresAt = new Date(snapshot.expiresAt as string);
    this._identityId = IdentityId.create(snapshot.identityId as string);
    this._token = SessionToken.create(snapshot.token as string);
  }

  validate(): void {
    if (this._expiresAt <= new Date(0)) {
      throw new Error('Session expiration must be valid');
    }
  }
}
