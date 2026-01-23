/**
 * Registry of authentication factor identifiers.
 *
 * Used for MFA and step-up authentication.
 */
export type AuthFactorRegistry = {
  password: 'password';
};

export type AuthFactorName = keyof AuthFactorRegistry;
