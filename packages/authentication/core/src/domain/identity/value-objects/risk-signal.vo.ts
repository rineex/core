import { RiskSignalName } from '@/types/risk-signal.type';
import { PrimitiveValueObject } from '@rineex/ddd';

/**
 * Represents a detected risk signal during authentication.
 */
export class RiskSignal extends PrimitiveValueObject<RiskSignalName> {
  protected validate(value: RiskSignalName): void {
    if (!value) {
      throw new Error('RiskSignal must be a valid identifier');
    }
  }

  public static create(value: RiskSignalName): RiskSignal {
    return new RiskSignal(value);
  }
}
