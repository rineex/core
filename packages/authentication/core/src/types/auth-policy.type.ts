/**
 * Registry of authentication policy identifiers.
 *
 * This registry is intentionally open for module augmentation.
 * Each policy package extends this type.
 */
export type AuthPolicyRegistry = {
  readonly base: true;
};

/**
 * Union of all registered authentication policy names.
 *
 * Enables autocomplete and compile-time safety.
 */
export type AuthPolicyName = keyof AuthPolicyRegistry;
