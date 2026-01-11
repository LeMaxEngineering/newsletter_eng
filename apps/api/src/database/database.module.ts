import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { Module } from '@nestjs/common';
import type { ProjectSummary, TemplateSummary } from '../projects/projects.types.js';

export const DATABASE = 'DATABASE_CONNECTION';

function ensureDataFolder(dataDir: string) {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

function seedFromJson(db: Database.Database, dataDir: string) {
  const seedPath = join(dataDir, 'projects.json');
  if (!existsSync(seedPath)) {
    return;
  }

  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projectCount.count > 0) {
    return;
  }

  const raw = readFileSync(seedPath, 'utf-8');
  const projects = JSON.parse(raw) as ProjectSummary[];

  const projectStmt = db.prepare(
    `INSERT INTO projects (id, name, owner, status, updated_at) VALUES (@id, @name, @owner, @status, @updatedAt)`
  );
  const templateStmt = db.prepare(
    `INSERT INTO templates (id, project_id, name, version, status, updated_at)
     VALUES (@id, @projectId, @name, @version, @status, @updatedAt)`
  );

  const insert = db.transaction(() => {
    for (const project of projects) {
      projectStmt.run({
        id: project.id,
        name: project.name,
        owner: project.owner,
        status: project.status,
        updatedAt: project.updatedAt
      });
      for (const template of project.templates) {
        templateStmt.run({
          id: template.id,
          projectId: project.id,
          name: template.name,
          version: template.version,
          status: template.status,
          updatedAt: template.updatedAt
        });
      }
    }
  });

  insert();
}

function initializeDatabase(): Database.Database {
  const dataDir = join(process.cwd(), 'data');
  ensureDataFolder(dataDir);
  const dbPath = join(dataDir, 'newsletter.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  seedFromJson(db, dataDir);

  return db;
}

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => initializeDatabase()
    }
  ],
  exports: [DATABASE]
})
export class DatabaseModule {}
