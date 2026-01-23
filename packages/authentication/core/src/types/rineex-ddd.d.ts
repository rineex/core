import '@rineex/ddd';

declare module '@rineex/ddd' {
  interface DomainErrorNamespaces {
    AUTH_CORE_MFA: [
      'CHALLENGE_ID_INVALID',
      'CHALLENGE_STATUS_INVALID',
      'SESSION_ID_INVALID',
    ];
    AUTH_CORE_TOKEN: ['INVALID'];
    AUTH_CORE_SCOPE: ['INVALID'];
    AUTH_CORE_SESSION: ['INVALID'];
  }
}
