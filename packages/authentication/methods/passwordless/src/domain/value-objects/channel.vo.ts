import { InvalidValueObjectError, PrimitiveValueObject } from '@rineex/ddd';

const allowedChannel = ['email', 'sms', 'authenticator_app', 'push'] as const;

/**
 * Type representing valid passwordless channel identifiers.
 */
export type PasswordlessChannelType = (typeof allowedChannel)[number];

/**
 * Value object representing a passwordless authentication channel.
 *
 * Valid channels include:
 * - email: Email-based passwordless authentication
 * - sms: SMS-based passwordless authentication
 * - authenticator_app: Authenticator app-based authentication
 * - push: Push notification-based authentication
 */
export class PasswordlessChannel extends PrimitiveValueObject<PasswordlessChannelType> {
  /**
   * Creates a new PasswordlessChannel value object.
   *
   * @param {PasswordlessChannelType} channel - The channel identifier
   * @returns {PasswordlessChannel} A new PasswordlessChannel instance
   * @throws {InvalidValueObjectError} If the channel is not in the allowed list
   */
  public static create(channel: PasswordlessChannelType): PasswordlessChannel {
    return new PasswordlessChannel(channel);
  }

  /**
   * Validates the channel value.
   *
   * @param {PasswordlessChannelType} value - The value to validate
   * @throws {InvalidValueObjectError} If the channel is not in the allowed list
   */
  protected validate(value: PasswordlessChannelType): void {
    if (!allowedChannel.includes(value)) {
      throw InvalidValueObjectError.create(
        `Invalid passwordless channel: ${value}`,
        { value },
      );
    }
  }
}
