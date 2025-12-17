import { describe, expect, it } from 'vitest';

import { UserAgent } from '../user-agent.vo';

describe('userAgent Value Object', () => {
  const desktopUA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';
  const mobileUA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
  const botUA = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

  it('should create a valid UserAgent', () => {
    const ua = UserAgent.create(desktopUA);

    expect(ua.value).toBe(desktopUA);
  });

  it('should parse browser and OS from user-agent string', () => {
    const ua = UserAgent.create(desktopUA);

    expect(ua.browser.name).toBeDefined();
    expect(ua.os.name).toBeDefined();
  });

  it('should detect desktop', () => {
    const ua = UserAgent.create(desktopUA);

    expect(ua.isDesktop).toBe(true);
    expect(ua.isMobile).toBe(false);
    expect(ua.isTablet).toBe(false);
    expect(ua.isBot).toBe(false);
  });

  it('should detect mobile', () => {
    const ua = UserAgent.create(mobileUA);

    expect(ua.isMobile).toBe(true);
    expect(ua.isDesktop).toBe(false);
  });

  it('should detect bot', () => {
    const ua = UserAgent.create(botUA);

    expect(ua.isBot).toBe(true);
  });

  it('should throw for invalid user-agent strings', () => {
    expect(() => UserAgent.create('')).toThrow();
    expect(() => UserAgent.create('a')).toThrow();
  });
});
