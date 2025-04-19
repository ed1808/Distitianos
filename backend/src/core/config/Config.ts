import { createSecretKey, KeyObject } from "node:crypto";

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;
const jwtAlgorithm = process.env.JWT_ALGORITHM;
const dbUrl = process.env.POSTGRES_URL;

if (!jwtSecret) throw new Error('Missing secret key');
if (!jwtExpiration) throw new Error('Missing token expiration');
if (!jwtAlgorithm) throw new Error('Missing JWT algorithm');
if (!dbUrl) throw new Error('Missing database URL connection');

interface AppConfig {
  secretKey: KeyObject;
  tokenExpiration: string;
  algorithm: string;
  databaseUrl: string;
}

const secretKey = createSecretKey(jwtSecret, 'utf8');

export const appConfig: AppConfig = {
  secretKey,
  tokenExpiration: jwtExpiration,
  algorithm: jwtAlgorithm,
  databaseUrl: dbUrl,
};
