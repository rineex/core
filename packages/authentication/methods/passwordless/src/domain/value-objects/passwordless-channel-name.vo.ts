import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

/**
 * Identifier for a passwordless authentication channel.
 *
 * This value object:
 * - Is stable
 * - Serializable
 * - Used for routing logic (registry lookup)
 *
 * It does NOT contain behavior.
 */
const allowedChannel = ['email', 'sms', 'authenticator_app', 'push'] as const;

export type PasswordlessChannelNameLiteral = (typeof allowedChannel)[number];

export class PasswordlessChannelName extends PrimitiveValueObject<PasswordlessChannelNameLiteral> {
  protected validate(value: PasswordlessChannelNameLiteral): void {
    if (!value || !allowedChannel.includes(value)) {
      throw InvalidValueObjectError.create(`Invalid Channel: ${value}`, {
        value,
      });
    }
  }

  public static create(
    value: PasswordlessChannelNameLiteral,
  ): PasswordlessChannelName {
    return new PasswordlessChannelName(value);
  }
}
