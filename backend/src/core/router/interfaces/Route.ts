import type { Middleware } from '../../middlewares/types/Middleware';
import type { RouteHandler } from '../types/RouteHandler';

export interface Route {
  pattern: RegExp;
  handler: RouteHandler;
  paramNames: string[];
  middlewares: Middleware[];
}
