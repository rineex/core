import { describe, expect, it } from 'vitest';

import { UserAgent, UserAgentProps } from '../user-agent.vo';

describe('userAgent Value Object', () => {
  const mockMetadata: UserAgentProps = {
    raw: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    device: { model: 'iPhone', vendor: 'Apple', type: 'mobile' },
    browser: { name: 'Chrome', version: '120' },
    os: { version: '17', name: 'iOS' },
    isBot: false,
  };

  it('should identify a mobile device correctly', () => {
    const sut = new UserAgent(mockMetadata.raw, mockMetadata);

    expect(sut.isMobile).toBe(true);
  });

  it('should be equal to another VO with the same raw string', () => {
    const ua1 = new UserAgent(mockMetadata.raw, mockMetadata);
    const ua2 = new UserAgent(mockMetadata.raw, mockMetadata);

    expect(ua1.equals(ua2)).toBe(true);
  });

  it('should throw if raw string is too short', () => {
    expect(() => new UserAgent('abc', mockMetadata)).toThrow('UA too short');
  });
});
