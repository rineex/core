import { Entity, EntityProps } from '@rineex/ddd';

import { OAuthAuthorizationId } from '../value-objects/oauth-authorization-id.vo';
import { InvalidRedirectUriError } from '../errors/invalid-redirect-uri.error';
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
    this.validate();
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

  protected validateProps(props: OAuthAuthorizationProps): void {
    if (!props.redirectUri.startsWith('https://')) {
      throw InvalidRedirectUriError.create({
        redirectUri: props.redirectUri,
      });
    }
  }

  protected restore(snapshot: Record<string, unknown>): void {
    this.mutate(current => ({
      ...current,
      pkce: snapshot.pkce
        ? Pkce.fromJSON(snapshot.pkce as Record<string, unknown>)
        : undefined,
      redirectUri: snapshot.redirectUri as string,
      provider: snapshot.provider as OAuthProvider,
      scope: snapshot.scope as string[],
    }));
  }

  protected snapshot(): Record<string, unknown> {
    return this.toObject();
  }
}
