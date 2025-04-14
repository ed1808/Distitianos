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

  /**
   * Gets the singleton instance of the Database class.
   * If no instance exists, creates a new one following the Singleton pattern.
   * @returns {Database} The singleton instance of the Database class
   */
  static get instance(): Database {
    if (!Database._instance) {
      Database._instance = new Database();
    }

    return Database._instance;
  }

  /**
   * Deletes records from a specified table based on given conditions.
   * 
   * @param table - The name of the table to delete records from
   * @param where - An object containing column-value pairs as deletion conditions
   * @returns A Promise that resolves to:
   *          - true if at least one record was deleted
   *          - false if no records were deleted
   *          - Error if the deletion operation failed
   * 
   * @example
   * ```typescript
   * // Delete all users with age 25
   * await db.delete('users', { age: 25 })
   * 
   * // Delete all records from table
   * await db.delete('users')
   * ```
   */
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

  /**
   * Inserts a new record into the specified table in the database.
   * @template T - Array type extending readonly array of objects or undefined values
   * @param {string} table - The name of the table to insert into
   * @param {Record<any, any>} insertData - Object containing the data to insert
   * @returns {Promise<object | undefined | Error>} The inserted record if successful, undefined or Error if failed 
   * @throws {Error} When there is a database error during insertion
   */
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

  /**
   * Performs a SELECT query on the specified table with the given conditions.
   * 
   * @param {string} table - The name of the table to query
   * @param {string[]} columns - Array of column names to select
   * @param {Record<string, string | number>} [where={}] - Object containing WHERE conditions as key-value pairs
   * @param {Record<string, 'ASC' | 'DESC'>} [orderBy={}] - Object containing ORDER BY conditions with column names and sort direction
   * @param {number} [offset=0] - Number of rows to skip
   * @param {number} [limit=100] - Maximum number of rows to return
   * 
   * @returns {Promise<object | undefined | Error>} Returns the first result if WHERE conditions are provided,
   *          otherwise returns all results. Returns undefined or Error if no results or query fails.
   * 
   * @template T - Array type containing objects or undefined values
   * 
   * @throws {Error} Throws an error if no results are found
   */
  async select<T extends readonly (object | undefined)[]>(
    table: string,
    columns: string[],
    where: Record<string, string | number> = {},
    orderBy: Record<string, 'ASC' | 'DESC'> = {},
    offset: number = 0,
    limit: number = 100
  ): Promise<T | Error> {
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

      return result;
    } catch (error) {
      return error as Error;
    }
  }

  /**
   * Updates records in the specified database table based on given conditions.
   * 
   * @param table - The name of the table to update records in
   * @param updateObject - An object containing column-value pairs to update
   * @param where - An object containing column-value pairs for the WHERE clause conditions
   * @returns Promise resolving to number of affected rows or Error if update fails
   * 
   * @example
   * ```typescript
   * // Update user's email where id = 1
   * const result = await db.update(
   *   'users',
   *   { email: 'new@email.com' },
   *   { id: 1 }
   * );
   * ```
   */
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

  /**
   * Executes a raw SQL query directly against the database.
   * 
   * @param sqlQuery - The SQL query string to be executed
   * @returns Promise that resolves to the query results or Error if the query fails
   * @throws {Error} If there is a database connection or query execution error
   * 
   * @example
   * ```ts
   * const results = await database.raw('SELECT * FROM users');
   * ```
   */
  async raw(sqlQuery: string): Promise<any | Error> {
    try {
      return await this.sql.unsafe(sqlQuery);
    } catch (error) {
      return error as Error;
    }
  }

  /**
   * Joins SQL conditions into a single SQL template literal
   * @param conditions - Array of SQL conditions to join
   * @param separator - SQL separator to use between conditions (e.g. AND, OR)
   * @returns A SQL template literal with joined conditions
   */
  private joinSqlSentence(conditions: any[], separator: any) {
    return conditions.reduce((prev, curr, idx) => {
      return idx === 0 ? curr : this.sql`${prev}${separator}${curr}`;
    }, null);
  }
}
