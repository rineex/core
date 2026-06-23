import type { InferErrorCodes } from '@rineex/ddd';

export const PasswordlessErrorRegistry = {
  AUTH_PASSWORDLESS: [
    'CHALLENGE_EXPIRED',
    'CHALLENGE_ALREADY_USED',
    'SECRET_MISMATCH',
    'CHANNEL_REQUIRED',
    'SECRET_REQUIRED',
    'INVALID_EXPIRATION',
    'CHALLENGE_NOT_FOUND',
  ],
} as const;

export type PasswordlessDomainErrorCode = InferErrorCodes<
  typeof PasswordlessErrorRegistry
>;
