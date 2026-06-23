/**
 * Core domain error codes shipped with `@rineex/ddd`.
 * Bounded contexts define their own registries using the same shape.
 */
export const CoreDomainErrorRegistry = {
  CORE: [
    'INTERNAL_ERROR',
    'VALIDATION_FAILED',
    'CONFIGURATION_ERROR',
    'NOT_IMPLEMENTED',
  ],
  SYSTEM: ['UNEXPECTED', 'TIMEOUT', 'NETWORK_ERROR', 'DEPENDENCY_ERROR'],
  DOMAIN: ['INVALID_VALUE', 'INVALID_STATE'],
} as const;

/**
 * Derives a union of `NAMESPACE.ERROR_NAME` literals from a registry const.
 */
export type InferErrorCodes<R extends Record<string, readonly string[]>> = {
  [NS in string &
    keyof R]: `${Uppercase<NS>}.${Uppercase<string & R[NS][number]>}`;
}[string & keyof R];

export type CoreDomainErrorCode = InferErrorCodes<
  typeof CoreDomainErrorRegistry
>;

/**
 * Runtime set of all codes declared in a registry.
 */
export function registryErrorCodes(
  registry: Record<string, readonly string[]>,
): ReadonlySet<string> {
  const codes = new Set<string>();

  for (const [namespace, names] of Object.entries(registry)) {
    for (const name of names) {
      codes.add(`${namespace}.${name}`);
    }
  }

  return codes;
}
