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

  async delete() {}

  async insert() {}

  async select<T extends readonly (object | undefined)[]>(
    table: string,
    columns: string[],
    where: Record<string, string> = {},
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

  async update() {}

  private joinSqlSentence(conditions: any[], separator: any) {
    return conditions.reduce((prev, curr, idx) => {
      return idx === 0 ? curr : this.sql`${prev}${separator}${curr}`;
    }, null);
  }
}
