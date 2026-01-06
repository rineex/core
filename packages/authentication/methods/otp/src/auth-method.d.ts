import '@rineex/auth-core';

/**
 * Module augmentation for registering OTP auth method.
 */
declare module '@rineex/auth-core' {
  interface AuthMethodRegistry {
    readonly otp: true;
  }
}
