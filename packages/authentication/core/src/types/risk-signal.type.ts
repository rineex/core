/**
 * Registry of risk signal identifiers.
 *
 * Signals are produced by detectors and consumed by policies.
 */
export type RiskSignalRegistry = {};

/**
 * Union of all registered risk signal names.
 */
export type RiskSignalName = keyof RiskSignalRegistry;
