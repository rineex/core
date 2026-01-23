/**
 * Registry of identity provider identifiers.
 *
 * Supports social login, enterprise SSO, and internal IdPs.
 */
export type IdentityProviderRegistry = {};

export type IdentityProviderName = keyof IdentityProviderRegistry;
