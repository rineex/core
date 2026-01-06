export type TokenRepository = {
  save: (token: Token) => Promise<void>;

  getById: (id: string) => Promise<Token | null>;

  /**
   * Revokes all active tokens for an identity.
   * Used for logout-all / security events.
   */
  revokeAllByIdentity: (identityId: string) => Promise<void>;
};
