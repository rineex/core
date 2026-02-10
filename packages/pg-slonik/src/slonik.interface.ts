import type { ClientConfigurationInput } from 'slonik';

/** Connection name used for DI token and logging. Uppercased in token. */
export type SlonikConnectionName = string;

/** Tag type for connection metadata. */
export type SlonikConnectionTags = string;

/**
 * Configuration for a single Slonik connection.
 * Passed to Slonik's createPool(dsn, options).
 */
export interface SlonikConnectionConfig {
  /** Unique name for this connection (used for InjectPool and token). */
  name: SlonikConnectionName;
  /** Slonik client options (interceptors, typeParsers, timeouts, etc.). */
  options?: ClientConfigurationInput;
  /** PostgreSQL connection URI (DSN). */
  dsn: string;
  /** Optional tags for connection metadata. */
  tags?: SlonikConnectionTags[];
}

/** Options for SlonikModule.register(); requires at least one connection. */
export interface SlonikModuleOptions {
  connections: SlonikConnectionConfig[];
}

/** Extra options for configurable module (e.g. global registration). */
export interface SlonikModuleExtraOptions {
  isGlobal?: boolean;
}
