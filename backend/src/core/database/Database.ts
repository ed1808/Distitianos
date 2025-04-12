import postgres, { type Sql } from 'postgres';

export class Database {
  private static _instance: Database;
  private sql: Sql;

  private constructor() {
    if (!process.env.POSTGRES_URL) {
      throw new Error('Missing database URL connection');
    }

    this.sql = postgres(process.env.POSTGRES_URL);
  }

  static get instance(): Database {
    if (!Database._instance) {
      Database._instance = new Database();
    }

    return Database._instance;
  }

  async delete(
    table: string,
    where: Record<string, string | number> = {}
  ): Promise<boolean | Error> {
    const whereConditions = Object.entries(where).map(([column, value]) => {
      return this.sql`${this.sql(column)} = ${value}`;
    });

    const whereClause =
      whereConditions.length > 0
        ? this.sql`WHERE ${this.joinSqlSentence(
            whereConditions,
            this.sql` AND `
          )}`
        : this.sql``;

    try {
      const result = await this.sql`
        DELETE FROM
          ${this.sql(table)}
        ${whereClause}
      `;

      return result.count > 0;
    } catch (error) {
      return error as Error;
    }
  }

  async insert<T extends readonly (object | undefined)[]>(
    table: string,
    insertData: Record<any, any>
  ): Promise<object | undefined | Error> {
    try {
      const result = await this.sql<T>`
        INSERT INTO ${this.sql(table)} ${this.sql(insertData)} RETURNING *
      `;

      return result;
    } catch (error) {
      return error as Error;
    }
  }

  async select<T extends readonly (object | undefined)[]>(
    table: string,
    columns: string[],
    where: Record<string, string | number> = {},
    orderBy: Record<string, 'ASC' | 'DESC'> = {},
    offset: number = 0,
    limit: number = 100
  ): Promise<object | undefined | Error> {
    const whereConditions = Object.entries(where).map(([column, value]) => {
      return this.sql`${this.sql(column)} = ${value}`;
    });

    const orderConditions = Object.entries(orderBy).map(
      ([column, direction]) => {
        return this.sql`${this.sql(column)} ${this.sql(direction)}`;
      }
    );

    const whereClause =
      whereConditions.length > 0
        ? this.sql`WHERE ${this.joinSqlSentence(
            whereConditions,
            this.sql` AND `
          )}`
        : this.sql``;

    const orderByClause =
      orderConditions.length > 0
        ? this.sql`ORDER BY ${this.joinSqlSentence(
            orderConditions,
            this.sql`, `
          )}`
        : this.sql``;

    try {
      const result = await this.sql<T>`
        SELECT 
          ${this.sql(columns)} 
        FROM 
          ${this.sql(table)} 
        ${whereClause} 
        ${orderByClause} 
        LIMIT ${limit} 
        OFFSET ${offset}
      `;

      if (!result.length) {
        throw new Error('Not found');
      }

      return whereConditions.length > 0 ? result[0] : result;
    } catch (error) {
      return error as Error;
    }
  }

  async update(
    table: string,
    updateObject: Record<string, any>,
    where: Record<string, string | number>
  ): Promise<number | Error> {
    const whereConditions = Object.entries(where).map(([column, value]) => {
      return this.sql`${this.sql(column)} = ${value}`;
    });

    const whereClause = 
      whereConditions.length > 0
        ? this.sql`WHERE ${this.joinSqlSentence(
            whereConditions, 
            this.sql` AND `
          )}`
        : this.sql``;

    try {
      const result = await this.sql`
        UPDATE
          ${this.sql(table)}
        SET
          ${this.sql(updateObject)}
        ${whereClause}
      `;

      return result.count;
    } catch (error) {
      return error as Error;
    }
  }

  private joinSqlSentence(conditions: any[], separator: any) {
    return conditions.reduce((prev, curr, idx) => {
      return idx === 0 ? curr : this.sql`${prev}${separator}${curr}`;
    }, null);
  }
}
