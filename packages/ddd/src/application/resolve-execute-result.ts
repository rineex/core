import type { ApplicationExecuteResult } from './ports/application-service.port';

/**
 * Normalizes sync or async {@link ApplicationServicePort.execute} results at call-site boundaries.
 *
 * Use in infrastructure (HTTP interceptors, JWT signing, guards) so hot-path callers
 * can invoke sync services without `await` while async services keep working.
 */
export function resolveExecuteResult<O>(
  result: ApplicationExecuteResult<O>,
): Promise<O> {
  return Promise.resolve(result);
}
