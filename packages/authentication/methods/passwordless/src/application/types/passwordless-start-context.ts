import { PasswordlessChannel } from '@/domain/value-objects/channel.vo';

/**
 * Input contract for starting a passwordless authentication flow.
 *
 * This context is:
 * - owned by the passwordless method
 * - opaque to auth-core
 * - validated inside the method
 */
export type PasswordlessStartContext = {
  /**
   * Delivery channel identifier.
   *
   * Examples:
   * - email
   * - sms
   * - push
   * - authenticator_app
   */
  readonly channel: PasswordlessChannel;

  /**
   * Channel-specific destination.
   *
   * Examples:
   * - email address
   * - phone number
   * - device identifier
   */
  readonly destination: string;
};
