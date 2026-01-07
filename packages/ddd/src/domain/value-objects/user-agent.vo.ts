import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { ValueObject } from '../base/vo';

export interface UserAgentProps {
  readonly raw: string;
  readonly browser: { name?: string; version?: string };
  readonly os: { name?: string; version?: string };
  readonly device: { model?: string; type?: string; vendor?: string };
  readonly isBot: boolean;
}
export class UserAgent extends ValueObject<string> {
  get isBot(): boolean {
    return this.metadata.isBot;
  }

  get isMobile(): boolean {
    return this.metadata.device.type === 'mobile';
  }

  // Store metadata as a private field, not part of the ValueObject identity (props)
  // This keeps .equals() fast (only compares the UA string)
  private readonly metadata: UserAgentProps;

  // We make the constructor internal-friendly
  constructor(rawString: string, metadata: UserAgentProps) {
    super(rawString);
    this.metadata = metadata;
  }

  getProps(): string {
    return this.props;
  }

  protected validate(value: string): void {
    if (value.length < 5) throw new InvalidValueObjectError('UA too short');
  }
}
