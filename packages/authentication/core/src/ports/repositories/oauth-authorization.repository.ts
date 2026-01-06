import { OauthAuthorization } from '@/domain/oauth/aggregates/oauth-authorization.aggregate';

export type OAuthAuthorizationRepository = {
  /**
   * Persists an OAuth authorization aggregate.
   */
  save: (authorization: OauthAuthorization) => Promise<void>;

  /**
   * Loads authorization by its identifier.
   */
  getById: (id: string) => Promise<OauthAuthorization | null>;

  /**
   * Finds active authorization by client and identity.
   */
  findActiveByClientAndIdentity: (params: {
    readonly clientId: string;
    readonly identityId: string;
  }) => Promise<OauthAuthorization | null>;
};
