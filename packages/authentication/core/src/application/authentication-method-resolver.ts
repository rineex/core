import { AuthMethodPort } from '@/ports';
import { AuthMethodName } from '@/types';

export class AuthenticationMethodResolver {
  private readonly registry = new Map<AuthMethodName, AuthMethodPort>();

  register(method: AuthMethodPort): void {
    if (this.registry.has(method.method)) {
      throw new Error(`Auth method already registered: ${method.method}`);
    }

    this.registry.set(method.method, method);
  }

  resolve(method: AuthMethodName): AuthMethodPort {
    const found = this.registry.get(method);

    if (!found) {
      throw new Error(`Provided Auth Method is not registered: ${method}`);
    }

    return found;
  }
}
