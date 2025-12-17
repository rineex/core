import { UAParser } from 'ua-parser-js';
import { isbot } from 'isbot';
import { z } from 'zod';

import { InvalidValueObjectError } from '../errors/invalid-vo.error';
import { ValueObject } from '../base/vo';

type Props = string;

export class UserAgent extends ValueObject<Props> {
  private static schema = z.string().min(5).max(512);

  get browser(): Pick<UAParser.IBrowser, 'name' | 'version'> {
    return {
      version: this.parsed.browser.version,
      name: this.parsed.browser.name,
    };
  }

  get device(): Pick<UAParser.IDevice, 'model' | 'type' | 'vendor'> {
    return this.parsed.device;
  }

  get isBot(): boolean {
    return isbot(this.props);
  }

  get isDesktop(): boolean {
    return !this.parsed.device.type;
  }

  get isMobile(): boolean {
    return this.parsed.device.type === 'mobile';
  }

  get isTablet(): boolean {
    return this.parsed.device.type === 'tablet';
  }

  get os(): Pick<UAParser.IOS, 'name' | 'version'> {
    return {
      version: this.parsed.os.version,
      name: this.parsed.os.name,
    };
  }

  private get parsed(): UAParser.IResult {
    return new UAParser().setUA(this.props).getResult();
  }

  public static create(value: string) {
    return new UserAgent(value);
  }

  protected validate(value: Props): void {
    const result = UserAgent.schema.safeParse(value);

    if (!result.success) {
      throw new InvalidValueObjectError(
        `Invalid UserAgent: ${result.error.message}`,
      );
    }
  }
}
