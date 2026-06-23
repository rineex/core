import { registryErrorCodes } from '@rineex/ddd';

import { describe, expect, it } from 'vitest';

import { InvalidAuthenticationTransitionError } from '../../identity/errors/invalid-authentication-transition.error';
import { AuthorizationAlreadyUsedError } from '../../oauth/errors/authorization-already-used.error';
import { InvalidAuthorizationCodeError } from '../../oauth/errors/invalid-authorization-code.error';
import { MfaActiveChallengeExistsError } from '../../mfa/errors/mfa-active-challenge-exists.error';
import { AuthenticationAttemptError } from '../../identity/errors/authentication-attempt.error';
import { InvalidOAuthProviderError } from '../../oauth/errors/invalid-oauth-provider.error';
import { AuthorizationExpiredError } from '../../oauth/errors/authorization-expired.error';
import { MfaAttemptsExceededError } from '../../mfa/errors/mfa-attempts-exceeded.error';
import { MfaChallengeExpiredError } from '../../mfa/errors/mfa-challenge-expired.error';
import { InvalidRedirectUriError } from '../../oauth/errors/invalid-redirect-uri.error';
import { IdentityDisabledError } from '../../identity/errors/identity-disabled.error';
import { MfaAlreadyVerifiedError } from '../../mfa/errors/mfa-already-verified.error';
import { ConsentRequiredError } from '../../oauth/errors/consent-required.error';
import { InvalidPkceError } from '../../oauth/errors/invalid-pkce.error';
import { MfaExpiredError } from '../../mfa/errors/mfa-expired.error';
import { AuthCoreErrorRegistry } from '../auth-core-error.registry';
import { InvalidAuthTokenError } from '../invalid-auth-token.error';
import { InvalidSessionError } from '../invalid-session.error';
import { InvalidScopeError } from '../invalid-scope.error';

const authCoreCodes = registryErrorCodes(AuthCoreErrorRegistry);

describe('authCore domainError architecture', () => {
  it('should register all auth-core error codes in AuthCoreErrorRegistry', () => {
    const errors = [
      InvalidAuthTokenError.create('x', { actualLength: 1, minLength: 2 }),
      InvalidSessionError.create(),
      InvalidScopeError.create('x', { scope: 'read' }),
      IdentityDisabledError.create('x', { identityId: 'id-1' }),
      InvalidAuthenticationTransitionError.create('x', { status: 'disabled' }),
      new AuthenticationAttemptError('x', {}),
      MfaExpiredError.create(),
      MfaAlreadyVerifiedError.create(),
      MfaChallengeExpiredError.create(),
      MfaActiveChallengeExistsError.create(),
      MfaAttemptsExceededError.create(1, 3),
      AuthorizationExpiredError.create(),
      AuthorizationAlreadyUsedError.create(),
      ConsentRequiredError.create(),
      InvalidAuthorizationCodeError.create(),
      InvalidOAuthProviderError.create({ value: 'google' }),
      InvalidPkceError.create(),
      InvalidRedirectUriError.create({ redirectUri: 'https://x.com' }),
    ];

    for (const error of errors) {
      expect(authCoreCodes.has(error.code)).toBe(true);
    }
  });
});
