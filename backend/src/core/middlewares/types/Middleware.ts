import type { RouteContext } from '../../router/interfaces/RouteContext';

export type Middleware = (
  context: RouteContext
) => Promise<Response | null> | Response | null;
