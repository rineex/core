import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

const allowedChannel = ['email', 'sms', 'authenticator_app', 'push'] as const;

export type PasswordlessChannelType = (typeof allowedChannel)[number];

export class PasswordlessChannel extends PrimitiveValueObject<PasswordlessChannelType> {
  protected validate(value: PasswordlessChannelType): void {
    if (!allowedChannel.includes(value)) {
      throw InvalidValueObjectError.create(
        `Invalid passwordless channel: ${value}`,
        { value },
      );
    }
  }

  public static create(channel: PasswordlessChannelType): PasswordlessChannel {
    return new PasswordlessChannel(channel);
  }
}
