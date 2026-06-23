import type { InferErrorCodes } from '@rineex/ddd';

export const OtpErrorRegistry = {
  AUTH_OTP: ['AUTHENTICATION_FAILED'],
} as const;

export type OtpDomainErrorCode = InferErrorCodes<typeof OtpErrorRegistry>;
