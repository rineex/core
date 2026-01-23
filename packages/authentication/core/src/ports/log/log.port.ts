/**
 * Application-level logger port.
 *
 * Must be:
 * - side-effect only
 * - non-throwing
 * - fast
 *
 * Domain must never depend on this.
 */
export type LoggerPort = {
  info: (message: string, metadata?: Readonly<Record<string, unknown>>) => void;

  debug: (
    message: string,
    metadata?: Readonly<Record<string, unknown>>,
  ) => void;

  warn: (message: string, metadata?: Readonly<Record<string, unknown>>) => void;

  error: (
    message: string,
    metadata?: Readonly<Record<string, unknown>>,
  ) => void;
};
