import { Pool } from 'pg';

const globalForPg = global as unknown as { pool: Pool };

const dbName = process.env.DATABASE_URL?.split('/').pop()?.split('?')[0];
console.log(`[Database] Initializing connection pool to: ${dbName}`);

export const pool =
  globalForPg.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
