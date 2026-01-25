import { AggregateRoot, EntityProps } from '@rineex/ddd';

import isNil from 'lodash.isnil';

import { defaultIfNilOrEmpty } from '@/utils/default-if-blank.util';
import { IdentityId } from '@/domain/identity';

import { AuthorizationAlreadyUsedError } from '../errors/authorization-already-used.error';
import { AuthorizationExpiredError } from '../errors/authorization-expired.error';
import { OAuthAuthorizationId } from '../value-objects/oauth-authorization-id.vo';
import { AuthorizationCode } from '../value-objects/authorization-code.vo';
import { ConsentRequiredError } from '../errors/consent-required.error';
import { CodeChallenge } from '../value-objects/code-challenge.vo';
import { RedirectUri } from '../value-objects/redirect-uri.vo';
import { ClientId } from '../value-objects/client-id.vo';
import { ScopeSet } from '../value-objects/scope-set.vo';

export interface OAuthAuthorizationProps {
  readonly identityId: IdentityId;
  readonly clientId: ClientId;
  readonly redirectUri: RedirectUri;
  readonly scopes: ScopeSet;
  readonly codeChallenge?: CodeChallenge;

  consentGrantedAt?: Date;
  authorizationCode?: AuthorizationCode;
  readonly expiresAt: Date;
}

export class OauthAuthorization extends AggregateRoot<
  OAuthAuthorizationId,
  OAuthAuthorizationProps
> {
  protected constructor(
    props: EntityProps<OAuthAuthorizationId, OAuthAuthorizationProps>,
  ) {
    super(props);
  }

  grantConsent(now: Date): void {
    if (!this.requiresConsent()) {
      return;
    }

    this.mutate(current => ({
      ...current,
      consentGrantedAt: now,
    }));
  }

  isExpired(now: Date): boolean {
    return now > this.props.expiresAt;
  }

  issueAuthorizationCode(code: AuthorizationCode): void {
    if (this.props.authorizationCode) {
      throw AuthorizationAlreadyUsedError.create();
    }

    if (this.requiresConsent()) {
      throw ConsentRequiredError.create();
    }

    this.mutate(current => ({
      ...current,
      authorizationCode: code,
    }));
  }

  requiresConsent(): boolean {
    return isNil(this.props.consentGrantedAt);
  }

  toObject() {
    return {
      consentGrantedAt: defaultIfNilOrEmpty(
        this.props.consentGrantedAt?.toISOString(),
      ),
      authorizationCode: defaultIfNilOrEmpty(
        this.props.authorizationCode?.toString(),
      ),
      codeChallenge: defaultIfNilOrEmpty(this.props.codeChallenge?.toString()),
      redirectUri: this.props.redirectUri.toString(),
      expiresAt: this.props.expiresAt.toISOString(),
      identityId: this.props.identityId.toString(),
      scopes: this.props.scopes.toStringArray(),
      clientId: this.props.clientId.toString(),
      id: this.id.toString(),
    };
  }

  validate() {
    if (this.props.expiresAt.getTime() <= Date.now()) {
      throw AuthorizationExpiredError.create();
    }
  }

  protected restore(snapshot: Record<string, unknown>): void {
    this.props.consentGrantedAt = snapshot.consentGrantedAt
      ? new Date(snapshot.consentGrantedAt as string)
      : undefined;

    this.props.authorizationCode = snapshot.authorizationCode
      ? AuthorizationCode.create(snapshot.authorizationCode as string)
      : undefined; // Assume fromString exists
  }

  protected snapshot(): Record<string, unknown> {
    return {
      consentGrantedAt: this.props.consentGrantedAt?.toISOString() ?? null,
      authorizationCode: this.props.authorizationCode?.toString() ?? null,
    };
  }
}
