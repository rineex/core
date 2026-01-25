import { PrimitiveValueObject, ValueObject } from '@rineex/ddd';

export class Scope extends PrimitiveValueObject<string> {
  static create(scope: string): Scope {
    return new Scope(scope);
  }

  protected validate(value: string): void {
    if (!/^[-0-:_a-z]+$/.test(value)) {
      throw new Error('Invalid scope format');
    }
  }
}

export class ScopeSet extends ValueObject<ReadonlySet<Scope>> {
  public static create() {
    return new ScopeSet(new Set<Scope>());
  }

  static fromStrings(scopes: readonly string[]): ScopeSet {
    return new ScopeSet(new Set(scopes.map(scope => Scope.create(scope))));
  }

  has(scope: Scope): boolean {
    return [...this.props].some(s => s.equals(scope));
  }

  toStringArray(): string[] {
    return [...this.props].map(s => s.value);
  }

  protected validate(value: ReadonlySet<Scope>): void {
    if (value.size === 0) {
      throw new Error('At least one scope is required');
    }
  }
}
