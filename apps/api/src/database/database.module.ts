import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import type { ProjectSummary } from '../projects/projects.types.js';

export const DATABASE = 'DATABASE_CONNECTION';

type PgPool = Pool;

function createPool(): PgPool {
  const sslEnabled = process.env.PG_SSL === 'true';

  return new Pool({
    host: process.env.PG_HOST ?? 'localhost',
    port: Number(process.env.PG_PORT ?? 5432),
    database: process.env.PG_DATABASE ?? 'newsletter',
    user: process.env.PG_USER ?? 'newsletter',
    password: process.env.PG_PASSWORD ?? 'newsletter',
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
  });
}

async function ensureSchema(pool: PgPool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at TEXT NOT NULL
    );
  `);
}

async function seedFromJson(pool: PgPool) {
  const dataDir = join(process.cwd(), 'data');
  const seedPath = join(dataDir, 'projects.json');
  if (!existsSync(seedPath)) {
    return;
  }

  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text as count FROM projects');
  if (Number(rows[0]?.count ?? 0) > 0) {
    return;
  }

  const payload = JSON.parse(readFileSync(seedPath, 'utf-8')) as ProjectSummary[];

  await pool.query('BEGIN');
  try {
    for (const project of payload) {
      await pool.query(
        `INSERT INTO projects (id, name, owner, status, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [project.id, project.name, project.owner, project.status, project.updatedAt ?? new Date().toISOString()]
      );

      for (const template of project.templates) {
        await pool.query(
          `INSERT INTO templates (id, project_id, name, version, status, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [
            template.id,
            project.id,
            template.name,
            template.version,
            template.status,
            template.updatedAt ?? new Date().toISOString()
          ]
        );
      }
    }
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: async () => {
        const pool = createPool();
        await ensureSchema(pool);
        await seedFromJson(pool);
        return pool;
      }
    }
  ],
  exports: [DATABASE]
})
export class DatabaseModule {}
