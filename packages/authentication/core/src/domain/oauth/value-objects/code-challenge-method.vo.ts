import { PrimitiveValueObject } from '@rineex/ddd';

export type CodeChallengeMethodValue = 'plain' | 'S256';

export class CodeChallengeMethod extends PrimitiveValueObject<CodeChallengeMethodValue> {
  static create(value: CodeChallengeMethodValue): CodeChallengeMethod {
    return new CodeChallengeMethod(value);
  }

  protected validate(value: CodeChallengeMethodValue): void {
    if (value !== 'plain' && value !== 'S256') {
      throw new Error('Unsupported code challenge method');
    }
  }
}
