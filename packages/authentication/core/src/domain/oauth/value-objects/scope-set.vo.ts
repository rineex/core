import { PrimitiveValueObject, ValueObject } from '@rineex/ddd';

export class Scope extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!/^[-0-:_a-z]+$/.test(value)) {
      throw new Error('Invalid scope format');
    }
  }

  static create(scope: string): Scope {
    return new Scope(scope);
  }
}

export class ScopeSet extends ValueObject<ReadonlySet<Scope>> {
  public static create() {
    return new ScopeSet(new Set<Scope>());
  }

  protected validate(value: ReadonlySet<Scope>): void {
    if (value.size === 0) {
      throw new Error('At least one scope is required');
    }
  }

  static fromStrings(scopes: readonly string[]): ScopeSet {
    return new ScopeSet(new Set(scopes.map(scope => Scope.create(scope))));
  }

  has(scope: Scope): boolean {
    return [...this.props].some(s => s.equals(scope));
  }

  toStringArray(): string[] {
    return [...this.props].map(s => s.getValue());
  }
}
