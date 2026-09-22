/**
 * Represents runtime facts available during a decision execution.
 *
 * A decision context should contain only immutable input data required by
 * constraints, features, and decision strategies.
 *
 * It must not contain infrastructure dependencies such as repositories,
 * network clients, loggers, clocks, or event publishers.
 */
export type DecisionContext = Readonly<Record<string, unknown>>;
