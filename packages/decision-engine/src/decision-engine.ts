/** Options used to identify a decision-engine module instance. */
export interface DecisionEngineOptions {
  /** A human-readable name for this initialized instance. */
  readonly name?: string;

  /** The application version associated with this initialized instance. */
  readonly version?: string;
}

/** A ready-to-compose decision-engine module. */
export interface DecisionEngineModule {
  readonly name: string;
  readonly version?: string;
}

const defaultName = 'decision-engine';

/**
 * Initializes a framework-independent decision-engine module.
 *
 * The returned descriptor is intentionally immutable so it can safely be
 * shared as the composition root grows to include rules and evaluators.
 */
export function initDecisionEngine(
  options: DecisionEngineOptions = {},
): DecisionEngineModule {
  const name = options.name?.trim() || defaultName;
  const version = options.version?.trim() || undefined;

  return Object.freeze({ name, version });
}
