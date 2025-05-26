import { Cache } from '../../core/cache/Cache';
import { Database } from '../../core/database/Database';
import { HttpStatusCode } from '../../core/router/utils/HttpStatusCodes';

import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
} from '../models/Category';
import type { ServiceResponse } from '../../core/types/ServiceResponse';

export class CategoriesService {
  private db: Database;
  private static categoriesCache = new Cache<Category[]>();

  constructor() {
    this.db = Database.instance;
  }

  async getCategories(
    offset?: string,
    limit?: string
  ): Promise<ServiceResponse<Category[]>> {
    const cacheKey = `categories-${offset}-${limit}`;
    const cachedData = CategoriesService.categoriesCache.get(cacheKey);

    if (cachedData) {
      return {
        data: cachedData,
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<Category[]>(
      'categories',
      ['id', 'category_name'],
      { active: true },
      { category_name: 'ASC' },
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

    const categories = result.slice(0, result.length);
    CategoriesService.categoriesCache.set(cacheKey, categories);

    return {
      data: categories,
      status: HttpStatusCode.OK,
    };
  }

  async getCategory(categoryId: number): Promise<ServiceResponse<Category>> {
    const cacheKey = `category-${categoryId}`;
    const cachedData = CategoriesService.categoriesCache.get(cacheKey);

    if (cachedData?.[0]) {
      return {
        data: cachedData[0],
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<Category[]>(
      'categories',
      ['id', 'category_name'],
      { id: categoryId }
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

    const category = result.slice(0, result.length);
    CategoriesService.categoriesCache.set(cacheKey, category);

    return {
      data: category[0]!,
      status: HttpStatusCode.OK,
    };
  }

  async createCategory(
    categoryData: CategoryCreate
  ): Promise<ServiceResponse<Category>> {
    const result = await this.db.insert<Category[]>('categories', categoryData);

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    if (!result) {
      return {
        data: null,
        error: 'Insert operation failed',
        status: HttpStatusCode.BAD_REQUEST,
      };
    }

    const category = result.slice(0, result.length);
    CategoriesService.categoriesCache.clear();

    return {
      data: category[0]!,
      status: HttpStatusCode.OK,
    };
  }

  async updateCategory(
    categoryId: number,
    categoryData: CategoryUpdate
  ): Promise<ServiceResponse<number>> {
    const result = await this.db.update('categories', categoryData, {
      id: categoryId,
    });

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    CategoriesService.categoriesCache.clear();

    return {
      data: result,
      status: HttpStatusCode.OK,
    };
  }

  async deleteCategory(categoryId: number): Promise<ServiceResponse<number>> {
    const result = await this.db.update(
      'categories',
      { active: false },
      { id: categoryId }
    );

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      };
    }

    CategoriesService.categoriesCache.clear();

    return {
      data: result,
      status: HttpStatusCode.OK,
    };
  }
}
