/**
 * Registry for MFA challenge mechanisms.
 *
 * This registry is intentionally open for module augmentation.
 * Each MFA-related package can extend it safely.
 */
export type MfaChallengeTypeRegistry = {
  readonly authenticator_app: true;
  readonly email: true;
  readonly sms: true;
};

/**
 * Union of all registered MFA challenge types.
 *
 * Provides:
 * - IDE autocomplete
 * - Type safety
 * - Extension without modifying core
 */
export type MfaChallengeType = keyof MfaChallengeTypeRegistry;
