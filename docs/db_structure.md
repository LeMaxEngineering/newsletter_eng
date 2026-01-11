# Database & Data Model Structure

_Last updated: January 11, 2026_

## Phase 2 Persistence (PostgreSQL)
The API now uses PostgreSQL for persistence, provisioned via Docker (`docker-compose.yml`) and accessed through the `pg` driver. Connection settings live in `apps/api/.env` (see `.env.example`). On bootstrap the API ensures the schema exists and seeds from `data/projects.json` when the database is empty.

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
- `ProjectsService` uses the shared `pg.Pool` for CRUD operations with parameterized queries.
- IDs follow `proj_<slug>` / `tmpl_<slug>` derived from `randomUUID()`.
- Timestamp management: every mutation updates the parent `projects.updated_at` (“touch”) to keep ordering deterministic.

### Seed Data
- On first boot the service reads `data/projects.json` and inserts rows into both tables inside a transaction.
- Subsequent boots skip seeding if `projects` already contains data, preserving existing records.

### Local Operations
- Use `docker compose up postgres -d` to start the database.
- Apply env overrides via `apps/api/.env`.
- Tests rely on `pg-mem` (`createTestPool`) to keep suites isolated without mutating the running container.

## Interaction Diagram
1. React app issues CRUD requests via `/api/projects` and nested template endpoints.
2. API RolesGuard authorizes based on `x-user-roles` header.
3. ProjectsService persists changes to SQLite and returns hydrated project objects (with embedded templates + counts).
4. React Query invalidates the `projects` cache to refresh UI state.

## Backups & Local Reset
- Snapshot the `postgres_data` Docker volume or drop/recreate the database with `docker compose down -v && docker compose up`.
- For CI, we rely on the in-memory helper (`createTestPool`) built with `pg-mem` to isolate tests without touching real data.
