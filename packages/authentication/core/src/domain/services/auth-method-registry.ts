import { AuthenticationMethod } from '../identity/contracts/authentication-method';

export class AuthMethodRegistry {
  private readonly methods = new Map<string, AuthenticationMethod>();

  /**
   * Register authentication method.
   * Called at composition root.
   */
  register(method: AuthenticationMethod): void {
    if (this.methods.has(method.method)) {
      throw new Error(`Auth method already registered: ${method.method}`);
    }

    this.methods.set(method.method, method);
  }

  /**
   * Resolve authentication method.
   */
  resolve(method: string): AuthenticationMethod {
    const resolved = this.methods.get(method);

    if (!resolved) {
      throw new Error(`Unsupported auth method: ${method}`);
    }

    return resolved;
  }
}
