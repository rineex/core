import { AuthDomainViolation } from '@/domain/violations/auth-domain.violation';

export class InvalidRedirectUriViolation extends AuthDomainViolation {
  readonly code = 'OAUTH_REDIRECT_URI_INVALID';
  readonly message = 'Redirect URI is invalid or insecure';

  public static create(props: { redirectUri: string }) {
    return new InvalidRedirectUriViolation(props);
  }
}
