import { serve } from 'bun';

import { Router } from './src/core/router/Router';
import { Database } from './src/core/database/Database';
import type { City } from './src/locations/models/City';
import { HttpStatusCode } from './src/core/router/utils/HttpStatusCodes';

const router = new Router();
const database = Database.instance;

router.use(req => {
  console.log(
    `[${new Date().toISOString()}] ${req.req.method} ${new URL(req.url).pathname}`
  );
  return null;
});

router.get('/api/locations/cities', async ({ query }) => {
  const { limit, offset } = query;
  const result = await database.select<City[]>(
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

  const cities = result.slice(0, result.length);

  return Response.json(
    { message: cities },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

router.get('/api/locations/cities/:id', async ({ params }) => {
  const { id } = params;
  const result = await database.select<City[]>(
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

  const city = result.slice(0, result.length);

  return Response.json(
    { message: city },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

const server = serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  async fetch(req) {
    return router.handle(req);
  },
});

console.log(`Server running on port ${server.port}`);
