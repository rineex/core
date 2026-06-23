/**
 * Return type for {@link ApplicationServicePort.execute}.
 *
 * Sync implementations avoid Promise allocation on hot paths; async implementations
 * remain valid via structural typing (`Promise<O>` is assignable to `O | Promise<O>`).
 */
export type ApplicationExecuteResult<O> = O | Promise<O>;

/**
 * Port interface for application services that execute commands or queries.
 *
 * @template I - The input type for the service execution
 * @template O - The output type returned by the service execution
 *
 * @example
 * ```typescript
 * interface CreateUserInput {
 *   name: string;
 *   email: string;
 * }
 *
 * interface CreateUserOutput {
 *   id: string;
 *   name: string;
 * }
 *
 * // Async orchestration
 * class CreateUserService implements ApplicationServicePort<CreateUserInput, CreateUserOutput> {
 *   async execute(args: CreateUserInput): Promise<CreateUserOutput> {
 *     // implementation
 *   }
 * }
 *
 * // Sync cache read (no Promise on hot path)
 * class GetActiveSigningKeyService implements ApplicationServicePort<Input, Output> {
 *   execute(args: Input): Output {
 *     return { kid: '...', privateKeyPem: '...' };
 *   }
 * }
 * ```
 */
export interface ApplicationServicePort<I, O> {
  execute: (args: I) => ApplicationExecuteResult<O>;
}
