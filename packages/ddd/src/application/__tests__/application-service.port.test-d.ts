import { expectTypeOf } from 'expect-type';

import type { ApplicationServicePort } from '../ports/application-service.port';

type Output = { id: string };

declare class SyncService implements ApplicationServicePort<
  { name: string },
  Output
> {
  execute(args: { name: string }): Output;
}

declare class AsyncService implements ApplicationServicePort<
  { name: string },
  Output
> {
  execute(args: { name: string }): Promise<Output>;
}

expectTypeOf<SyncService>().toMatchTypeOf<
  ApplicationServicePort<{ name: string }, Output>
>();
expectTypeOf<AsyncService>().toMatchTypeOf<
  ApplicationServicePort<{ name: string }, Output>
>();
