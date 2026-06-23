import { expectTypeOf } from 'expect-type';

import type {
  ApplicationExecuteResult,
  ApplicationServicePort,
} from '../ports/application-service.port';

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

// Sync and async implementations both satisfy the port
expectTypeOf<SyncService>().toMatchTypeOf<
  ApplicationServicePort<{ name: string }, Output>
>();
expectTypeOf<AsyncService>().toMatchTypeOf<
  ApplicationServicePort<{ name: string }, Output>
>();

// Union type is exported for consumer aliases (e.g. CommandExecuteResult)
expectTypeOf<ApplicationExecuteResult<Output>>().toEqualTypeOf<
  Output | Promise<Output>
>();
