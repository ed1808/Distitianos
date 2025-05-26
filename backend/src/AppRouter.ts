import { HttpStatusCode } from './core/router/utils/HttpStatusCodes';
import { Router } from './core/router/Router';

import { CitiesService } from './locations/services/CitiesServices';
import { DepartmentsService } from './locations/services/DepartmentsService';
import type { DepartmentUpdate } from './locations/models/Department';
import type { CityUpdate } from './locations/models/City';
import { CategoriesService } from './categories/services/CategoriesService';
import type {
  CategoryCreate,
  CategoryUpdate,
} from './categories/models/Category';
import {
  validateBody,
  validateParams,
} from './core/middlewares/validation_types/ValidationMiddlewares';
import { categorySchema } from './categories/schemas/CategorySchema';
import { numericIdParamSchema } from './core/utils/schemas/ParamsSchema';
import { cityUpdateSchema } from './locations/schemas/CitySchema';
import { departmentUpdateSchema } from './locations/schemas/DepartmentSchema';

const appRouter = new Router();

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

/* ====== Departments routes ====== */
appRouter.get('/api/locations/departments', async ({ query }) => {
  const { limit, offset } = query;
  const service = new DepartmentsService();

  const result = await service.getDepartments(limit, offset);

  return Response.json(
    {
      message: result.data,
      error: result.error,
    },
    {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get(
  '/api/locations/departments/:id',
  validateParams(numericIdParamSchema),
  async ({ params }) => {
    const { id } = params;
    const departmentId = Number(id);

    const service = new DepartmentsService();
    const result = await service.getDepartmentById(departmentId);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.get(
  '/api/locations/departments/:id/cities',
  validateParams(numericIdParamSchema),
  async ({ params, query }) => {
    const { limit, offset } = query;
    const { id } = params;
    const departmentId = Number(id);

    const service = new CitiesService();
    const result = await service.getCitiesByDepartment(
      departmentId,
      offset,
      limit
    );

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.put(
  '/api/locations/departments/:id',
  validateParams(numericIdParamSchema),
  validateBody(departmentUpdateSchema),
  async ({ req, params }) => {
    const { id } = params;
    const departmentId = Number(id);
    const updateData = (await req.json()) as DepartmentUpdate;

    if (isNaN(departmentId)) {
      return Response.json(
        { message: 'Invalid department id' },
        {
          status: HttpStatusCode.BAD_REQUEST,
          headers: { 'Content-Type': 'application/problem+json' },
        }
      );
    }

    const service = new DepartmentsService();
    const result = await service.updateDepartment(departmentId, updateData);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.delete(
  '/api/locations/departments/:id',
  validateParams(numericIdParamSchema),
  async ({ params }) => {
    const { id } = params;
    const departmentId = Number(id);

    const service = new DepartmentsService();
    const result = await service.deleteDepartment(departmentId);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

/* ====== Cities routes ====== */
appRouter.get('/api/locations/cities', async ({ query }) => {
  const { limit, offset } = query;
  const service = new CitiesService();

  const result = await service.getCities(offset, limit);

  return Response.json(
    {
      message: result.data,
      error: result.error,
    },
    {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get(
  '/api/locations/cities/:id',
  validateParams(numericIdParamSchema),
  async ({ params }) => {
    const { id } = params;
    const cityId = Number(id);

    const service = new CitiesService();
    const result = await service.getCityById(cityId);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.put(
  '/api/locations/cities/:id',
  validateParams(numericIdParamSchema),
  validateBody(cityUpdateSchema),
  async ({ body, params }) => {
    const { id } = params;
    const cityId = Number(id);
    const updateData = body as CityUpdate;

    const service = new CitiesService();
    const result = await service.updateCity(cityId, updateData);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.delete(
  '/api/locations/cities/:id',
  validateParams(numericIdParamSchema),
  async ({ params }) => {
    const { id } = params;
    const cityId = Number(id);

    const service = new CitiesService();
    const result = await service.deleteCity(cityId);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

/* ||===============================|| */
/* ||====== Categories routes ======|| */
/* ||===============================|| */

appRouter.get('/api/categories', async ({ query }) => {
  const { limit, offset } = query;
  const service = new CategoriesService();

  const result = await service.getCategories(offset, limit);

  return Response.json(
    {
      message: result.data,
      error: result.error,
    },
    {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});

appRouter.get(
  '/api/categories/:id',
  validateParams(numericIdParamSchema),
  async ({ params }) => {
    const { id } = params;
    const categoryId = Number(id);

    const service = new CategoriesService();
    const result = await service.getCategory(categoryId);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.post(
  '/api/categories',
  validateBody(categorySchema),
  async ({ body }) => {
    const categoryData = body as CategoryCreate;
    const service = new CategoriesService();

    const result = await service.createCategory(categoryData);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.put(
  '/api/categories/:id',
  validateParams(numericIdParamSchema),
  validateBody(categorySchema),
  async ({ body, params }) => {
    const { id } = params;
    const categoryId = Number(id);
    const updateData = body as CategoryUpdate;

    const service = new CategoriesService();
    const result = await service.updateCategory(categoryId, updateData);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

appRouter.delete(
  '/api/categories/:id',
  validateParams(numericIdParamSchema),
  async ({ params }) => {
    const { id } = params;
    const categoryId = Number(id);

    const service = new CategoriesService();
    const result = await service.deleteCategory(categoryId);

    return Response.json(
      {
        message: result.data,
        error: result.error,
      },
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
);

export default appRouter;
