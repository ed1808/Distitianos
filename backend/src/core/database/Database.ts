import { sql } from 'bun';

export class Database {
  private static _instance: Database;

  private constructor() {}

  static get instance(): Database {
    if (!Database._instance) {
      Database._instance = new Database();
    }

    return Database._instance;
  }

  async fetchDepartments(
    filterId: number = 0,
    orderByCol: string = '',
    orderDirection: string = 'ASC',
    offset: number = 0,
    limit: number = 100
  ): Promise<any | Error> {
    const where = filterId === 0 ? sql`` : sql`WHERE id = ${filterId}`;

    const orderBy =
      orderByCol.trim() === '' ? sql`` : sql`${orderByCol} = ${orderDirection}`;

    try {
      const result = await sql`
            SELECT
               id,
               department_name,
               department_code
            FROM
                departments
            ${where}
            ${orderBy}
            LIMIT ${limit}
            OFFSET ${offset}
        `;

      return result;
    } catch (error) {
      return error as Error;
    }
  }

  async fetchCities(
    filterColumn: string = '',
    filterId: number = 0,
    orderByCol: string = '',
    orderDirection: string = 'ASC',
    offset: number = 0,
    limit: number = 100
  ): Promise<any | Error> {
    const where =
      filterId === 0 && filterColumn.trim() === ''
        ? sql``
        : sql`WHERE ${sql(filterColumn)} = ${filterId}`;

    const orderBy =
      orderByCol.trim() === '' ? sql`` : sql`${orderByCol} = ${orderDirection}`;

    try {
      const result = await sql`
            SELECT
               id,
               city_name,
               city_code,
               department_id
            FROM
                cities
            ${where}
            ${orderBy}
            LIMIT ${limit}
            OFFSET ${offset}
        `;

      return result;
    } catch (error) {
      return error as Error;
    }
  }
}
