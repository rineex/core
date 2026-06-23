import '@rineex/auth-core';
/**
 * Module augmentation for registering Passwordless auth method.
 */
declare module '@rineex/auth-core' {
  interface AuthMethodRegistry {
    readonly passwordless: true;
  }
}
