import { Cache } from '../../core/cache/Cache';
import { Database } from '../../core/database/Database';
import { HttpStatusCode } from '../../core/router/utils/HttpStatusCodes';

import type { Department, DepartmentUpdate } from '../models/Department';
import type { ServiceResponse } from '../../core/types/ServiceResponse';

export class DepartmentsService {
  private db: Database;
  private static departmentsCache = new Cache<Department[]>();

  constructor() {
    this.db = Database.instance;
  }

  async getDepartments(
    offset?: string,
    limit?: string
  ): Promise<ServiceResponse<Department[]>> {
    const cacheKey = `departments-${offset}-${limit}`;
    const cachedData = DepartmentsService.departmentsCache.get(cacheKey);

    if (cachedData) {
      return {
        data: cachedData,
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<Department[]>(
      'departments',
      ['id', 'department_name', 'department_code'],
      { active: true },
      { department_name: 'ASC' },
      offset ? Number(offset) : undefined,
      limit ? Number(limit) : undefined
    );

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    if (typeof result === 'string') {
      return {
        data: null,
        error: result,
        status: HttpStatusCode.NOT_FOUND,
      };
    }

    const departments = result.slice(0, result.length);
    DepartmentsService.departmentsCache.set(cacheKey, departments);

    return {
      data: departments,
      status: HttpStatusCode.OK,
    };
  }

  async getDepartmentById(
    departmentId: number
  ): Promise<ServiceResponse<Department>> {
    const cacheKey = `department-${departmentId}`;
    const cachedData = DepartmentsService.departmentsCache.get(cacheKey);

    if (cachedData?.[0]) {
      return {
        data: cachedData[0],
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<Department[]>(
      'departments',
      ['id', 'department_name', 'department_code'],
      { id: departmentId }
    );

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    if (typeof result === 'string') {
      return {
        data: null,
        error: result,
        status: HttpStatusCode.NOT_FOUND,
      };
    }

    const department = result.slice(0, result.length);
    DepartmentsService.departmentsCache.set(cacheKey, department);

    return {
      data: department[0]!,
      status: HttpStatusCode.OK,
    };
  }

  async updateDepartment(
    departmentId: number,
    departmentData: DepartmentUpdate
  ): Promise<ServiceResponse<number>> {
    const result = await this.db.update('departments', departmentData, {
      id: departmentId,
    });

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    DepartmentsService.departmentsCache.clear();

    return {
      data: result,
      status: HttpStatusCode.OK,
    };
  }

  async deleteDepartment(
    departmentId: number
  ): Promise<ServiceResponse<number>> {
    const result = await this.db.update(
      'departments',
      { active: false },
      { id: departmentId }
    );

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    DepartmentsService.departmentsCache.clear();

    return {
      data: result,
      status: HttpStatusCode.OK,
    };
  }
}
