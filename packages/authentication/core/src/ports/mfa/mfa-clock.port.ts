/**
 * Time abstraction for MFA logic.
 *
 * Required for:
 * - expiration checks
 * - deterministic testing
 * - avoiding Date.now() in domain
 */
export type MfaClock = {
  now: () => Date;
};
