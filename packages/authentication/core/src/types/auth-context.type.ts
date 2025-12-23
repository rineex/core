/**
 * Context passed across authentication boundaries.
 *
 * This type is intentionally open-ended and extensible.
 */
export type AuthContext = {
  readonly correlationId: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata?: Record<string, unknown>;
};
