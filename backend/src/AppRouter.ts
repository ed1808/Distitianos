import { Database } from './core/database/Database';
import { HttpStatusCode } from './core/router/utils/HttpStatusCodes';
import { Router } from './core/router/Router';

import type { City } from './locations/models/City';
import type { Department } from './locations/models/Department';

const appRouter = new Router();
const dbInstance = Database.instance;

/* ||=========================|| */
/* ||====== Middlewares ======|| */
/* ||=========================|| */

appRouter.use(req => {
  console.log(
    `[${new Date().toISOString()}] ${req.req.method} ${
      new URL(req.url).pathname
    }`
  );
  return null;
});

/* ||=============================|| */
/* ||====== Location routes ======|| */
/* ||=============================|| */

appRouter.get('/api/locations/departments', async ({ query }) => {
  const { limit, offset } = query;
  const result = await dbInstance.select<Department[]>(
    'departments',
    ['id', 'department_name', 'department_code'],
    { active: true },
    { department_name: 'ASC' },
    offset ? Number(offset) : undefined,
    limit ? Number(limit) : undefined
  );

  if (result instanceof Error) {
    return Response.json(
      { message: result.message },
      {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof result === 'string') {
    return Response.json(
      { message: result },
      {
        status: HttpStatusCode.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const departments = result.slice(0, result.length);

  return Response.json(
    { message: departments },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get('/api/locations/departments/:id', async ({ params }) => {
  const { id } = params;
  const result = await dbInstance.select<Department[]>(
    'departments',
    ['id', 'department_name', 'department_code'],
    { id: id! }
  );

  if (result instanceof Error) {
    return Response.json(
      { message: result.message },
      {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof result === 'string') {
    return Response.json(
      { message: result },
      {
        status: HttpStatusCode.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const department = result.slice(0, result.length);

  return Response.json(
    { message: department },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get('/api/locations/departments/:id/cities', async ({ params, query }) => {
  const { limit, offset } = query;
  const { id } = params;
  
  const result = await dbInstance.select<City[]>(
    'cities',
    ['id', 'city_name', 'city_code'],
    { department_id: id! },
    { city_name: 'ASC' },
    offset ? Number(offset) : undefined,
    limit ? Number(limit) : undefined
  )

  if (result instanceof Error) {
    return Response.json(
      { message: result.message },
      {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof result === 'string') {
    return Response.json(
      { message: result },
      {
        status: HttpStatusCode.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const cities = result.slice(0, result.length);

  return Response.json(
    { message: cities },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get('/api/locations/cities', async ({ query }) => {
  const { limit, offset } = query;
  const result = await dbInstance.select<City[]>(
    'cities',
    ['id', 'city_name', 'city_code'],
    undefined,
    undefined,
    offset ? Number(offset) : undefined,
    limit ? Number(limit) : undefined
  );

  if (result instanceof Error) {
    return Response.json(
      { message: result.message },
      {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof result === 'string') {
    return Response.json(
      { message: result },
      {
        status: HttpStatusCode.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const cities = result.slice(0, result.length);

  return Response.json(
    { message: cities },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get('/api/locations/cities/:id', async ({ params }) => {
  const { id } = params;
  const result = await dbInstance.select<City[]>(
    'cities',
    ['id', 'city_name', 'city_code'],
    { id: id! }
  );

  if (result instanceof Error) {
    return Response.json(
      { message: result.message },
      {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (typeof result === 'string') {
    return Response.json(
      { message: result },
      {
        status: HttpStatusCode.NOT_FOUND,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const city = result.slice(0, result.length);

  return Response.json(
    { message: city },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

export default appRouter;
