/**
 * Open registry for passwordless channel identifiers.
 *
 * Each channel implementation extends this registry
 * via TypeScript module augmentation.
 */
export type PasswordlessChannelRegistry = {
  readonly email: true;
};
