import { PrimitiveValueObject } from '@rineex/ddd';

import { RiskSignalName } from '@/types/risk-signal.type';

/**
 * Represents a detected risk signal during authentication.
 */
export class RiskSignal extends PrimitiveValueObject<RiskSignalName> {
  public static create(value: RiskSignalName): RiskSignal {
    return new RiskSignal(value);
  }

  protected validate(value: RiskSignalName): void {
    if (!value) {
      throw new Error('RiskSignal must be a valid identifier');
    }
  }
}
