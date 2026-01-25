import { AggregateRoot, EntityProps } from '@rineex/ddd';

import { IdentityDisabledError } from '../errors/identity-disabled.error';
import { IdentityDisabledEvent } from '../events/identity-disabled.event';
import { IdentityCreatedEvent } from '../events/identity-created.event';
import { IdentityStatus } from '../value-objects/identity-status.vo';
import { IdentityId } from '../value-objects/identity-id.vo';

type IdentityProps = {
  readonly status: IdentityStatus;
};

export class Identity extends AggregateRoot<IdentityId, IdentityProps> {
  private constructor(params: EntityProps<IdentityId, IdentityProps>) {
    super(params);
  }

  public static create(): Identity {
    const identity = new Identity({
      props: { status: IdentityStatus.Active() },
      id: IdentityId.generate(),
    });

    identity.addEvent(IdentityCreatedEvent.create(identity.id));

    return identity;
  }

  /**
   * Rehydrate identity from persistence.
   */
  public static rehydrate(id: IdentityId, props: IdentityProps): Identity {
    return new Identity({ props, id });
  }

  /**
   * Guard method for all auth flows.
   */
  public assertIsActive(): void {
    if (!this.props.status.isActive()) {
      throw IdentityDisabledError.create('Identity disabled', {
        identityId: this.id.toString(),
      });
    }
  }

  disable(): void {
    if (!this.props.status.isActive()) {
      throw IdentityDisabledError.create('Identity is already disabled', {
        identityId: this.id.toString(),
      });
    }

    this.mutate(current => ({
      ...current,
      status: IdentityStatus.Disabled(),
    }));

    this.addEvent(IdentityDisabledEvent.create(this.id));
  }

  toObject() {
    return {
      status: this.props.status.toString(),
      id: this.id.value,
    };
  }

  validate(): void {
    if (!this.props.status) {
      throw IdentityDisabledError.create('Identity status is required', {
        identityId: this.id.toString(),
      });
    }
  }
}
