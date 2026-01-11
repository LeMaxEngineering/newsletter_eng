# Database & Data Model Structure

_Last updated: January 11, 2026_

## Phase 1 Persistence (SQLite)
For the current milestone we migrated from JSON files to a lightweight SQLite database (`data/newsletter.db`) managed by the NestJS API via `better-sqlite3`. This file is created automatically on bootstrap and seeded from `data/projects.json` when empty.

### Tables
| Table | Columns | Notes |
| --- | --- | --- |
| `projects` | `id` (TEXT, PK), `name`, `owner`, `status` (`active`/`archived`), `updated_at` (ISO string) | Represents a workspace. `status` drives UI badges. |
| `templates` | `id` (TEXT, PK), `project_id` (FK), `name`, `version`, `status` (`draft`/`published`), `updated_at` | Child templates scoped to a project. FK cascade deletes templates when a project is removed. |

#### Schema DDL (apps/api/src/database/database.module.ts)
```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  updated_at TEXT NOT NULL
);
```

### Access Layer
- `ProjectsService` uses prepared statements and transactions for CRUD operations.
- IDs follow `proj_<slug>` / `tmpl_<slug>` derived from `randomUUID()`.
- Timestamp management: every mutation updates the parent `projects.updated_at` (“touch”) to keep ordering deterministic.

### Seed Data
- On first boot the service reads `data/projects.json` and inserts rows into both tables.
- Subsequent boots skip seeding if `projects` already contains data, preserving existing records.

### Future Migration Plan
- The SQLite schema mirrors the eventual PostgreSQL layout, easing migration by keeping column names/types consistent.
- To upgrade:
  1. Generate a proper migration (Prisma/Knex/dbmate) against PostgreSQL.
  2. Export data from `newsletter.db` (e.g., `.dump` or SELECT) and import into PostgreSQL.
  3. Point the NestJS provider to the new connection pool and deprecate the file-based adapter.

## Interaction Diagram
1. React app issues CRUD requests via `/api/projects` and nested template endpoints.
2. API RolesGuard authorizes based on `x-user-roles` header.
3. ProjectsService persists changes to SQLite and returns hydrated project objects (with embedded templates + counts).
4. React Query invalidates the `projects` cache to refresh UI state.

## Backups & Local Reset
- Since SQLite is file-based, developers can snapshot `data/newsletter.db` or delete it to re-seed from JSON.
- For CI, we rely on the in-memory helper (`createInMemoryDatabase`) used in Vitest to isolate tests without touching real data.
