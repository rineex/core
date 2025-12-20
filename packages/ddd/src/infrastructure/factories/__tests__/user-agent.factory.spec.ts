import { describe, expect, it } from 'vitest';

import { UserAgentFactory } from '../user-agent.factory';

describe('userAgentFactory', () => {
  const IPHONE_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

  it('should transform a real UA string into a valid Domain Object', () => {
    const userAgent = UserAgentFactory.create(IPHONE_UA);

    expect(userAgent.isMobile).toBe(true);
    expect(userAgent.isBot).toBe(false);
    // Verify our mapping works
    expect(userAgent.getProps()).toBe(IPHONE_UA);
  });

  it('should detect a Googlebot correctly', () => {
    const BOT_UA =
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    const userAgent = UserAgentFactory.create(BOT_UA);

    expect(userAgent.isBot).toBe(true);
  });
});
