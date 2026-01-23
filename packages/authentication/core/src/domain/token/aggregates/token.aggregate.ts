import { AggregateRoot, EntityProps } from '@rineex/ddd';
import { IdentityId } from '@/domain/identity';

interface TokenProps {
  readonly identityId: IdentityId;
  readonly expiresAt: Date;
  revokedAt?: Date;
}

type CreateAggregateTokenProps = EntityProps<IdentityId, TokenProps>;

export class Token extends AggregateRoot<IdentityId, TokenProps> {
  protected constructor(props: CreateAggregateTokenProps) {
    super({ ...props });
  }

  public isActive(now = new Date()): boolean {
    return (
      !this.props.revokedAt && this.props.expiresAt.getTime() > now.getTime()
    );
  }

  public revoke(at: Date): void {
    if (this.props.revokedAt) return;

    this.mutate(current => ({ ...current, revokedAt: at }));
  }

  toObject() {
    return {
      expiresAt: this.props.expiresAt.toISOString(),
      IdentityId: this.props.identityId.getValue(),
      revokedAt: this.props.revokedAt,
      isActive: this.isActive,
      id: this.id.getValue(),
    };
  }

  validate(): void {
    if (this.props.expiresAt.getTime() <= Date.now()) {
      throw new Error('Token already expired');
    }
  }
}
