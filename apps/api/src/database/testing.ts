import { newDb } from 'pg-mem';
import type { Pool } from 'pg';

export async function createTestPool(): Promise<Pool> {
  const db = newDb();
  const { Pool: MemPool } = db.adapters.createPg();
  const pool = new MemPool();

  await pool.query(`
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE templates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at TEXT NOT NULL
    );
  `);

  return pool;
}
