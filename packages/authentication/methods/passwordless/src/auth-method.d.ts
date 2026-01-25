import '@rineex/auth-core';
import '@rineex/ddd';
/**
 * Module augmentation for registering Passwordless auth method.
 */
declare module '@rineex/auth-core' {
  interface AuthMethodRegistry {
    readonly passwordless: true;
  }
}

declare module '@rineex/ddd' {
  interface DomainErrorNamespaces {
    AUTH_PASSWORDLESS: [
      'CHALLENGE_EXPIRED',
      'CHALLENGE_ALREADY_USED',
      'SECRET_MISMATCH',
      'CHANNEL_REQUIRED',
      'SECRET_REQUIRED',
      'INVALID_EXPIRATION',
    ];
  }
}
