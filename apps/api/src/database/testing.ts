import Database from 'better-sqlite3';

export function createInMemoryDatabase() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE templates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      updated_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  return db;
}
