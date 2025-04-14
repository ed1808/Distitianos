import type { RouteContext } from '../interfaces/RouteContext';

export type RouteHandler = (
  context: RouteContext
) => Promise<Response> | Response;
