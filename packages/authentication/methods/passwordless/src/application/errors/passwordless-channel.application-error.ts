import { ApplicationError } from '@rineex/ddd';

import snake from 'lodash.snakecase';

/**
 * Application error thrown when attempting to resolve a passwordless channel that has not been registered.
 *
 * This is an operational error that occurs at runtime when the application tries to access
 * a channel implementation that was not provided during registry initialization.
 *
 * @example
 * ```typescript
 * try {
 *   const channel = registry.resolve('whatsapp');
 * } catch (error) {
 *   if (error instanceof UnSupportedPasswordlessChannelApplicationError) {
 *     // Handle unsupported channel - return 400 Bad Request
 *     console.error(`Channel not available: ${error.metadata?.key}`);
 *   }
 * }
 * ```
 *
 * @extends {ApplicationError}
 */
export class UnSupportedPasswordlessChannelApplicationError extends ApplicationError {
  /**
   * Private constructor. Use {@link UnSupportedPasswordlessChannelApplicationError.create} to create instances.
   *
   * @param message - Human-readable error message
   * @param metadata - Error metadata containing optional channel key
   */
  private constructor(message: string, metadata: { key?: string }) {
    super({
      code: snake(UnSupportedPasswordlessChannelApplicationError.name),
      isOperational: true,
      metadata,
      message,
    });
  }

  /**
   * Factory method to create a new unsupported channel error instance.
   *
   * @param message - Human-readable error message describing the unsupported channel
   * @param metadata - Optional metadata object containing the channel key that was not found
   * @param metadata.key - Optional channel identifier that was not registered
   * @returns New error instance with code `"un_supported_passwordless_channel_application_error"`
   *
   * @example
   * ```typescript
   * throw UnSupportedPasswordlessChannelApplicationError.create(
   *   'Passwordless channel not registered: email',
   *   { key: 'email' }
   * );
   * ```
   */
  public static create(message: string, metadata: { key?: string }) {
    return new UnSupportedPasswordlessChannelApplicationError(
      message,
      metadata,
    );
  }
}

/**
 * Application error thrown when attempting to register a passwordless channel that is already registered.
 *
 * This is an operational error that occurs during registry initialization when duplicate channel
 * implementations are provided. This typically indicates a configuration error.
 *
 * @example
 * ```typescript
 * try {
 *   const registry = PasswordlessChannelRegistry.init([
 *     emailChannel,
 *     emailChannelDuplicate, // Same channel registered twice
 *   ]);
 * } catch (error) {
 *   if (error instanceof DuplicatePasswordlessChannelApplicationError) {
 *     // Fail fast during startup - configuration error
 *     console.error(`Duplicate channel: ${error.metadata?.key}`);
 *   }
 * }
 * ```
 *
 * @extends {ApplicationError}
 */
export class DuplicatePasswordlessChannelApplicationError extends ApplicationError {
  /**
   * Private constructor. Use {@link DuplicatePasswordlessChannelApplicationError.create} to create instances.
   *
   * @param message - Human-readable error message
   * @param metadata - Error metadata containing optional channel key
   */
  private constructor(message: string, metadata: { key?: string }) {
    super({
      code: snake(DuplicatePasswordlessChannelApplicationError.name),
      isOperational: true,
      metadata,
      message,
    });
  }

  /**
   * Factory method to create a new duplicate channel error instance.
   *
   * @param message - Human-readable error message describing the duplicate channel
   * @param metadata - Optional metadata object containing the channel key that was duplicated
   * @param metadata.key - Optional channel identifier that was registered multiple times
   * @returns New error instance with code `"duplicate_passwordless_channel_application_error"`
   *
   * @example
   * ```typescript
   * throw DuplicatePasswordlessChannelApplicationError.create(
   *   'Duplicate passwordless channel registered: email',
   *   { key: 'email' }
   * );
   * ```
   */
  public static create(message: string, metadata: { key?: string }) {
    return new DuplicatePasswordlessChannelApplicationError(message, metadata);
  }
}
