import { AuthMethodPort } from '@/ports';
import { AuthMethodName } from '@/types';

/**
 * Registry that maps authentication method names to their implementations.
 * Use {@link register} to add methods and {@link resolve} to look them up.
 */
export class AuthenticationMethodResolver {
  private readonly registry = new Map<AuthMethodName, AuthMethodPort>();

  /**
   * Registers an authentication method.
   * @param method - The auth method implementation to register
   * @throws {Error} When the method name is already registered
   */
  register(method: AuthMethodPort): void {
    if (this.registry.has(method.method)) {
      throw new Error(`Auth method already registered: ${method.method}`);
    }

    this.registry.set(method.method, method);
  }

  /**
   * Resolves an authentication method by name.
   * @param method - The auth method name to look up
   * @returns The registered auth method implementation
   * @throws {Error} When the method is not registered
   */
  resolve(method: AuthMethodName): AuthMethodPort {
    const found = this.registry.get(method);

    if (!found) {
      throw new Error(`Provided Auth Method is not registered: ${method}`);
    }

    return found;
  }
}
