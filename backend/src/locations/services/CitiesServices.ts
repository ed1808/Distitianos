import { Cache } from '../../core/cache/Cache';
import { Database } from '../../core/database/Database';
import { HttpStatusCode } from '../../core/router/utils/HttpStatusCodes';

import type { City, CityUpdate } from '../models/City';
import type { ServiceResponse } from '../../core/types/ServiceResponse';

export class CitiesService {
  private db: Database;
  private static citiesCache = new Cache<City[]>();

  constructor() {
    this.db = Database.instance;
  }

  async getCities(
    offset?: string,
    limit?: string
  ): Promise<ServiceResponse<City[]>> {
    const cacheKey = `cities-${offset}-${limit}`;
    const cachedData = CitiesService.citiesCache.get(cacheKey);

    if (cachedData) {
      return {
        data: cachedData,
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<City[]>(
      'cities',
      ['id', 'city_name', 'city_code'],
      undefined,
      undefined,
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

    const cities = result.slice(0, result.length);
    CitiesService.citiesCache.set(cacheKey, cities);

    return {
      data: cities,
      status: HttpStatusCode.OK,
    };
  }

  async getCitiesByDepartment(
    departmentId: number,
    offset?: string,
    limit?: string
  ): Promise<ServiceResponse<City[]>> {
    const cacheKey = `department-${departmentId}-cities`;
    const cachedData = CitiesService.citiesCache.get(cacheKey);

    if (cachedData) {
      return {
        data: cachedData,
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<City[]>(
      'cities',
      ['id', 'city_name', 'city_code'],
      { department_id: departmentId },
      { city_name: 'ASC' },
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

    const cities = result.slice(0, result.length);
    CitiesService.citiesCache.set(cacheKey, cities);

    return {
      data: cities,
      status: HttpStatusCode.OK,
    };
  }

  async getCityById(cityId: number): Promise<ServiceResponse<City>> {
    const cacheKey = `city-${cityId}`;
    const cachedData = CitiesService.citiesCache.get(cacheKey);

    if (cachedData?.[0]) {
      return {
        data: cachedData[0],
        status: HttpStatusCode.OK,
      };
    }

    const result = await this.db.select<City[]>(
      'cities',
      ['id', 'city_name', 'city_code'],
      { id: cityId }
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

    const city = result.slice(0, result.length);
    CitiesService.citiesCache.set(cacheKey, city);

    return {
      data: city[0]!,
      status: HttpStatusCode.OK,
    };
  }

  async updateCity(cityId: number, cityData: CityUpdate): Promise<ServiceResponse<number>> {
    const result = await this.db.update(
      'cities',
      cityData,
      { id: cityId }
    );

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR
      }
    }

    return {
      data: result,
      status: HttpStatusCode.OK
    }
  }

  async deleteCity(cityId: number): Promise<ServiceResponse<number>> {
    const result = await this.db.update(
      'cities',
      { active: false },
      { id: cityId }
    );

    if (result instanceof Error) {
      return {
        data: null,
        error: result.message,
        status: HttpStatusCode.INTERNAL_SERVER_ERROR
      }
    }

    CitiesService.citiesCache.clear();

    return {
      data: result,
      status: HttpStatusCode.OK
    }
  }
}
