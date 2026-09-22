/**
 * Base contract for events produced by the decision domain.
 *
 * Events describe facts that already happened during a decision execution.
 *
 * @typeParam Payload - Immutable event-specific payload.
 */
export interface DecisionEvent<Payload = Readonly<Record<string, unknown>>> {
  /**
   * Stable event type.
   *
   * Examples:
   * "decision.completed"
   * "candidate.rejected"
   */
  readonly type: string;

  /**
   * Identifier of the decision definition that produced this event.
   */
  readonly definitionId: string;

  /**
   * Version of the decision definition used during execution.
   */
  readonly definitionVersion: string;

  /**
   * Optional correlation identifier inherited from the decision request.
   */
  readonly correlationId?: string;

  /**
   * Immutable event-specific data.
   *
   * Payload must be serializable and must not contain services,
   * functions, mutable state, or infrastructure-specific objects.
   */
  readonly payload: Payload;
}
