import { AggregateRoot, CreateEntityProps } from '@rineex/ddd';
import { IdentityId } from '@/domain/identity';

interface TokenProps extends CreateEntityProps<IdentityId> {
  readonly identityId: IdentityId;
  readonly expiresAt: Date;
  revokedAt?: Date;
}

export class Token extends AggregateRoot<IdentityId> {
  protected constructor(private props: TokenProps) {
    super(props);
  }

  public revoke(at: Date): void {
    if (this.props.revokedAt) return;

    this.mutate(draft => {
      draft.revokedAt = at;
    });
  }

  public isActive(now = new Date()): boolean {
    return (
      !this.props.revokedAt && this.props.expiresAt.getTime() > now.getTime()
    );
  }

  validate(): void {
    if (this.props.expiresAt.getTime() <= Date.now()) {
      throw new Error('Token already expired');
    }
  }
}
