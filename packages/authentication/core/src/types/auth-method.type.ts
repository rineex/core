/**
 * Registry for authentication method identifiers.
 *
 * This type is intentionally open for module augmentation.
 * Each auth-method package extends this registry.
 */
export type AuthMethodRegistry = {
  readonly passwordless: true;
  readonly otp: true;
};

/**
 * Union of all registered authentication method names.
 *
 * This enables:
 * - IDE autocomplete
 * - Type safety
 * - Plugin-based extension
 */
export type AuthMethodName = keyof AuthMethodRegistry;
