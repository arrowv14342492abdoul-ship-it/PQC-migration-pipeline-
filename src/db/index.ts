import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool lazily if SQL credentials exist
export const createPool = () => {
  if (!process.env.SQL_HOST || !process.env.SQL_USER) {
    return null;
  }

  if (!global._postgresPool) {
    try {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 5,
        connectionTimeoutMillis: 5000,
      });

      // Prevent unhandled pool-level errors from crashing the application
      global._postgresPool.on('error', (err) => {
        console.warn('Optional Postgres pool notice:', err?.message || err);
      });
    } catch (_err) {
      return null;
    }
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance lazily
const pool = createPool();

// Initialize Drizzle with the pool and schema if pool is active, otherwise fallback gracefully
export const db: any = pool ? drizzle(pool, { schema }) : null;
