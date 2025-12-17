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
 * class CreateUserService implements ApplicationServicePort<CreateUserInput, CreateUserOutput> {
 *   async execute(args: CreateUserInput): Promise<CreateUserOutput> {
 *     // implementation
 *   }
 * }
 * ```
 */
export interface ApplicationServicePort<I, O> {
  execute: (args: I) => Promise<O>;
}
