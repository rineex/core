import { ValueObject } from '@rineex/ddd';

import { CodeChallengeMethod } from './code-challenge-method.vo';

export type CodeChallengeProps = {
  readonly value: string;
  readonly method: CodeChallengeMethod;
};

export class CodeChallenge extends ValueObject<CodeChallengeProps> {
  get method(): CodeChallengeMethod {
    return this.props.method;
  }

  static create(value: string, method: CodeChallengeMethod): CodeChallenge {
    return new CodeChallenge({ method, value });
  }

  protected validate(props: CodeChallengeProps): void {
    if (!props.value || props.value.length < 32) {
      throw new Error('Invalid code challenge value');
    }
  }
}
