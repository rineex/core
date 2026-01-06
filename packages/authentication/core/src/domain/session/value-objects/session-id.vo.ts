import { InvalidSessionViolation } from '@/domain/violations/invalid-session.violation';
import { PrimitiveValueObject } from '@rineex/ddd';

export class SessionId extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value || value.length < 16) {
      throw InvalidSessionViolation.create();
    }
  }
}
