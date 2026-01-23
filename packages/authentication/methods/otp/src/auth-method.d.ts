import '@rineex/auth-core';
import '@rineex/ddd';
/**
 * Module augmentation for registering OTP auth method.
 */
declare module '@rineex/auth-core' {
  interface AuthMethodRegistry {
    readonly otp: true;
  }
}

declare module '@rineex/ddd' {}
