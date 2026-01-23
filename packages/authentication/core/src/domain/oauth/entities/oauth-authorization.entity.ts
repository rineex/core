import { Entity, EntityProps } from '@rineex/ddd';

import { InvalidRedirectUriViolation } from '../violations/invalid-redirect-uri.violation';
import { OAuthAuthorizationId } from '../value-objects/oauth-authorization-id.vo';
import { OAuthProvider } from '../value-objects/oauth-provider.vo';
import { Pkce } from '../value-objects/pkce.vo';

export interface OAuthAuthorizationProps {
  provider: OAuthProvider;
  redirectUri: string;
  scope: readonly string[];
  pkce?: Pkce;
}

export class OAuthAuthorization extends Entity<
  OAuthAuthorizationId,
  OAuthAuthorizationProps
> {
  constructor(
    props: EntityProps<OAuthAuthorizationId, OAuthAuthorizationProps>,
  ) {
    super({ ...props });
  }

  toObject(): Record<string, unknown> {
    return {
      pkce: this.props.pkce ? this.props.pkce.toJSON() : undefined,
      redirectUri: this.props.redirectUri,
      provider: this.props.provider,
      scope: this.props.scope,
      id: this.id.getValue(),
    };
  }

  validate(): void {
    if (!this.props.redirectUri.startsWith('https://')) {
      throw InvalidRedirectUriViolation.create({
        redirectUri: this.props.redirectUri,
      });
    }
  }

  protected restore(snapshot: Record<string, unknown>): void {
    this.props.pkce = snapshot.pkce
      ? Pkce.fromJSON(snapshot.pkce as Record<string, unknown>)
      : undefined;
    this.props.redirectUri = snapshot.redirectUri as string;
    this.props.provider = snapshot.provider as OAuthProvider;
    this.props.scope = snapshot.scope as string[];
  }

  protected snapshot(): Record<string, unknown> {
    return this.toObject();
  }
}
