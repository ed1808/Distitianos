import type { Middleware } from '../middlewares/types/Middleware';
import type { Route } from './interfaces/Route';
import type { RouteContext } from './interfaces/RouteContext';
import type { HttpMethod } from './types/HttpMethods';
import type { RouteHandler } from './types/RouteHandler';
import { HttpStatusCode } from './utils/HttpStatusCodes';

export class Router {
  private routes: Record<HttpMethod, Route[]>;
  private middlewares: Middleware[];

  constructor() {
    this.routes = {
      GET: [],
      POST: [],
      PUT: [],
      DELETE: [],
      PATCH: [],
    };
    this.middlewares = [];
  }

  /**
   * Adds a middleware function to the router's middleware stack.
   * @param middleware - The middleware function to be added
   * @returns The router instance for method chaining
   */
  use(middleware: Middleware): Router {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Registers a GET route with the specified path and middleware/route handlers.
   * 
   * @param path - The URL path for the route
   * @param handlers - Array of middleware and route handler functions to process the request
   * @returns The Router instance for method chaining
   * 
   * @example
   * router.get('/users', authMiddleware, getUsersHandler);
   */
  get(path: string, ...handlers: (Middleware | RouteHandler)[]): Router {
    this.addRoute('GET', path, handlers);
    return this;
  }

  /**
   * Registers a POST route with the specified path and handlers.
   * @param path - The URL path for the route
   * @param handlers - One or more middleware functions or route handlers to process the request
   * @returns The router instance for method chaining
   */
  post(path: string, ...handlers: (Middleware | RouteHandler)[]): Router {
    this.addRoute('POST', path, handlers);
    return this;
  }

  /**
   * Adds a PUT route to the router.
   * @param path - The URL path for the route
   * @param handlers - One or more middleware or route handler functions to process the request
   * @returns The router instance for method chaining
   */
  put(path: string, ...handlers: (Middleware | RouteHandler)[]): Router {
    this.addRoute('PUT', path, handlers);
    return this;
  }

  /**
   * Adds a PATCH route to the router.
   * 
   * @param path - The URL path for the route
   * @param handlers - One or more middleware or route handler functions to process the request
   * @returns The router instance for method chaining
   * 
   * @example
   * router.patch('/users/:id', validateUser, updateUser);
   */
  patch(path: string, ...handlers: (Middleware | RouteHandler)[]): Router {
    this.addRoute('PATCH', path, handlers);
    return this;
  }

  /**
   * Register a DELETE route in the router.
   * @param path - The URL path for the DELETE route
   * @param handlers - Array of middleware and/or route handler functions to process the request
   * @returns The router instance for method chaining
   */
  delete(path: string, ...handlers: (Middleware | RouteHandler)[]): Router {
    this.addRoute('DELETE', path, handlers);
    return this;
  }

  /**
   * Handles incoming HTTP requests by matching the URL path to registered routes and executing the corresponding handler.
   * 
   * @param req - The incoming HTTP request object
   * @returns A Promise that resolves to a Response object
   * 
   * @throws Will catch and wrap any errors during request processing into a 500 response
   */
  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method as HttpMethod;

    if (!this.routes[method]) {
      return this.jsonResponse(
        { message: 'Method Not Allowed' },
        HttpStatusCode.METHOD_NOT_ALLOWED
      );
    }

    for (const route of this.routes[method]) {
      const match = path.match(route.pattern);

      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1]!;
        });

        const query: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
          query[key] = value;
        });

        const context: RouteContext = {
          req,
          params,
          url,
          query,
        };

        try {
          for (const middleware of this.middlewares) {
            const response = await middleware(context);
            if (response) {
              return response;
            }
          }

          for (const middleware of route.middlewares) {
            const response = await middleware(context);
            if (response) {
              return response;
            }
          }

          return await route.handler(context);
        } catch (error) {
          const errorDescription =
            error instanceof Error ? error.message : 'Unknown error';
          return this.jsonResponse(
            { message: 'Internal Server Error', description: errorDescription },
            HttpStatusCode.INTERNAL_SERVER_ERROR
          );
        }
      }
    }

    return this.jsonResponse(
      { message: 'Not found' },
      HttpStatusCode.NOT_FOUND
    );
  }

  /**
   * Adds a new route to the router with the specified HTTP method, path, and handlers.
   * 
   * @param method - The HTTP method for the route (GET, POST, PUT, DELETE, etc.)
   * @param path - The URL path pattern for the route. Can include dynamic parameters prefixed with ':'
   * @param handlers - An array of middleware functions and a route handler. The last handler in the array is treated as the main route handler
   * 
   * @throws {Error} When no handlers are provided for the route
   * 
   * @example
   * ```typescript
   * router.addRoute('GET', '/users/:id', [authMiddleware, userHandler]);
   * ```
   * 
   * @remarks
   * - Dynamic parameters in the path should be prefixed with ':' (e.g., '/users/:id')
   * - The last handler in the array is always treated as the main route handler
   * - All other handlers are treated as middleware functions
   */
  private addRoute(
    method: HttpMethod,
    path: string,
    handlers: (Middleware | RouteHandler)[]
  ): void {
    if (handlers.length === 0) {
      throw new Error(
        `The route ${method} ${path} must have at least one handler`
      );
    }

    const mainHandler = handlers.pop() as RouteHandler;
    const middlewares = handlers as Middleware[];

    let paramNames: string[] = [];
    const pattern = path
      .split('/')
      .map(segment => {
        if (segment.startsWith(':')) {
          paramNames.push(segment.slice(1));
          return '([^/]+)';
        }

        return segment;
      })
      .join('/');

    const routeRegex = new RegExp(`^${pattern}$`);

    this.routes[method].push({
      pattern: routeRegex,
      handler: mainHandler,
      paramNames,
      middlewares,
    });
  }

  private jsonResponse(
    data: any,
    statusCode: HttpStatusCode = HttpStatusCode.OK
  ) {
    return Response.json(data, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
