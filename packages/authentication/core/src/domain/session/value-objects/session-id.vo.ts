import { InvalidSessionDomainError } from '@/domain/violations/invalid-session.violation';
import { PrimitiveValueObject } from '@rineex/ddd';

export class SessionId extends PrimitiveValueObject<string> {
  public static create(v: string): SessionId {
    return new SessionId(v);
  }

  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidSessionDomainError.create();
    }
  }
}
