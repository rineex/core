/**
 * Open registry type for passwordless channel identifiers.
 *
 * This type serves as a registry that can be extended via TypeScript
 * module augmentation. Each channel implementation should extend this
 * registry to register its channel identifier.
 *
 * @example
 * ```typescript
 * declare module '@rineex/auth-passwordless' {
 *   interface PasswordlessChannelRegistry {
 *     readonly sms: true;
 *   }
 * }
 * ```
 */
export type PasswordlessChannelRegistry = {
  readonly email: true;
};
