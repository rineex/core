import { UAParser } from 'ua-parser-js';
import { isbot } from 'isbot';

import {
  UserAgent,
  UserAgentProps,
} from '@/domain/value-objects/user-agent.vo';

export class UserAgentFactory {
  public static create(uaString: string): UserAgent {
    // Execution happens once here
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const props: UserAgentProps = {
      device: {
        vendor: result.device.vendor,
        model: result.device.model,
        type: result.device.type,
      },
      browser: { version: result.browser.version, name: result.browser.name },
      os: { version: result.os.version, name: result.os.name },
      isBot: isbot(uaString),
      raw: uaString,
    };

    return new UserAgent(uaString, props);
  }
}
