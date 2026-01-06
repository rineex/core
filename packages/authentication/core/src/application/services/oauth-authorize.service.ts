import { ApplicationServicePort } from '@rineex/ddd';

export class OAuthAuthorizeService implements ApplicationServicePort<any, any> {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(command: any): Promise<any> {
    // Implementation goes here
  }
}
