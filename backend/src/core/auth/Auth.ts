import type { Database } from '../database/Database';
import type { UserLogin, User } from '../../users/models/User';

import { SignJWT, jwtVerify } from 'jose';
import { validatePassword } from '../utils/hashers/PasswordValidator';
import { appConfig } from '../config/Config';

export class Auth {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async login(user: UserLogin): Promise<string | null> {
    try {
      const result = await this.db.select<User[]>(
        'users',
        ['id', 'password', 'active'],
        { username: user.username }
      );

      if (result instanceof Error) {
        throw result;
      }

      const registeredUser = result[0];

      if (!validatePassword(user.password, registeredUser!.password)) {
        return null;
      }

      const token = await new SignJWT({
        id: registeredUser!.id,
      })
        .setProtectedHeader({
          alg: appConfig.algorithm,
        })
        .setIssuedAt()
        .setExpirationTime(appConfig.tokenExpiration)
        .sign(appConfig.secretKey);

      return token;
    } catch (error) {
      throw error;
    }
  }

  static async validateToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, appConfig.secretKey);
      return payload;
    } catch (error) {
      throw error;
    }
  }
}
