# User Manual – Interactive Newsletter Engine

_Last updated: January 11, 2026_

## 1. Prerequisites
- **Node.js** ≥ 20 (recommended 20.13.1 or later).
- **pnpm** 9.x activated via Corepack (`corepack prepare pnpm@9.0.0 --activate`).
- Git CLI for pulling/pushing changes.
- Modern browser (Chrome, Edge, Firefox) for the React web app.

## 2. Workspace Setup
```bash
# From repo root
corepack pnpm install
```
This installs dependencies for all workspaces (`apps/*`, `packages/*`). Re-run after pulling new changes.

## 3. Running Services
### 3.1 API (NestJS + SQLite persistence)
```
corepack pnpm --filter @neewsletter/api start:dev
```
- Boots on **http://localhost:4000** with global prefix `/api`.
- Health check: `GET http://localhost:4000/api/health` → `{ status: 'ok', timestamp: ... }`.
- The service now persists projects/templates to `data/newsletter.db` (SQLite + better-sqlite3). On first boot it seeds from `data/projects.json`.
- For prod-style build: `corepack pnpm --filter @neewsletter/api build` then `node dist/main.js`.

### 3.2 Web App (React + Vite)
```
corepack pnpm --filter @neewsletter/web dev
```
- Runs at **http://localhost:5173** (configurable in `apps/web/vite.config.ts`).
- Build for production: `corepack pnpm --filter @neewsletter/web build` (outputs to `apps/web/dist`).

## 4. Application Overview
### 4.1 Navigation
- **Dashboard**: Summary cards (active projects, templates, CTR uplift).
- **Editor**: Drag blocks from the library onto the canvas, manage workspace templates, and push new templates via the RBAC-protected form.
- **Analytics**: Placeholder for engagement dashboards.

### 4.2 Shared Packages
- `@neewsletter/block-schema`
  - Defines reusable block metadata (`blockCatalog`) and typing system.
  - Build via `corepack pnpm --filter @neewsletter/block-schema build`.
- `@neewsletter/ui-kit`
  - Houses shared React components (e.g., `Panel`, `StatCard`).
  - Build via `corepack pnpm --filter @neewsletter/ui-kit build`.

### 4.3 Template & Project Workflow
1. Load the **Editor** route and ensure the API is running.
2. Use **Project management** panel to pick, create, or update projects (name, owner, status). Project creation/updating requires `admin` or `editor`. Deletion is restricted to `admin`.
3. Use **Insert block** actions in the block library to populate the canvas preview.
4. Scroll to **Workspace templates** to review templates pulled from the active project (via `/projects`).
5. Template actions:
   - **Rename / status toggle / delete** buttons surface per template for admins/editors (delete restricted to admins).
   - **Create template** form POSTs to `/projects/:projectId/templates` and invalidates React Query cache on success.
   - Role requirements mirror the backend RBAC: `admin` or `editor` to create/update; `admin` to delete.

### 4.4 RBAC & Permissions
- Navigation links and route access are locked behind role requirements:
  - **Editor**: `admin` or `editor`
  - **Analytics**: `admin` or `analyst`
- The UI displays disabled nav links plus an “Access restricted” panel if a user hits a protected route without the right role.
- Project management + template controls show contextual messaging and disable actions when the user lacks the required role.
- Client-side RBAC + CRUD UI tests live in `apps/web/src/App.rbac.spec.tsx`; backend enforcement is covered by `RolesGuard` unit tests and the SQLite-backed `ProjectsService` suite.

### 4.5 API Surface (Projects + Templates)
| Endpoint | Method | Roles | Description |
| --- | --- | --- | --- |
| `/api/projects` | GET | any authenticated | List projects with embedded template summaries. |
| `/api/projects/:projectId` | GET | any authenticated | Fetch a single project with templates. |
| `/api/projects` | POST | `admin`, `editor` | Create a project (name, owner, status). |
| `/api/projects/:projectId` | PATCH | `admin`, `editor` | Update project metadata. |
| `/api/projects/:projectId` | DELETE | `admin` | Delete project (cascades templates). |
| `/api/projects/:projectId/templates` | POST | `admin`, `editor` | Create a template (name, version, status). |
| `/api/projects/:projectId/templates/:templateId` | PATCH | `admin`, `editor` | Update template name/status/version. |
| `/api/projects/:projectId/templates/:templateId` | DELETE | `admin` | Delete a template. |

All mutation requests must include the `x-user-roles` header mirroring the mock session roles to satisfy the backend RolesGuard.

## 5. Developer Workflow
1. **Install deps** – `corepack pnpm install`.
2. **Start API** – ensure port 4000 is free; run `corepack pnpm --filter @neewsletter/api start:dev`.
3. **Start Web** – `corepack pnpm --filter @neewsletter/web dev`.
4. **Code changes** – focus on packages/apps as needed.
5. **Testing / linting** – `corepack pnpm -r lint`, `corepack pnpm -r test` (when tests exist).
6. **Build verification** – `corepack pnpm --filter <package> build`.
7. **Git flow** – `git status`, `git add`, `git commit -m`, `git push origin master`.

## 6. Troubleshooting
| Issue | Symptoms | Resolution |
| --- | --- | --- |
| `EADDRINUSE: :4000` | API fails to start, error in terminal | `netstat -ano | findstr :4000`, then `Stop-Process -Id <PID>` before re-running start script. |
| `Cannot find module '@nestjs/common/core'` | TS compile error | Ensure `corepack pnpm install` completed successfully; rebuild `@neewsletter/api`. |
| `Cannot find type definition for 'vite/client'` | Web `tsc` fails | Confirm `apps/web/tsconfig.json` includes `"types": ["vite/client", "node"]` and `@types/node` installed. |
| pnpm missing | `pnpm : command not found` | Run `corepack prepare pnpm@9.0.0 --activate` or install pnpm globally. |

## 7. Documentation
- **Development plan**: `docs/development_plan.md`
- **Progress tracker**: `docs/project_progress.md`
- **Architecture overview**: `docs/architecture.md`
- **Wireframes (text spec)**: `docs/wireframes.md`
- **Product requirements**: `docs/prd.md`

## 8. Roadmap Snapshot
Phase 0 (Discovery & Architecture) is complete. Phase 1 (Core Editor & Auth) will deliver:
- React editor shell integrated with block schema + UI kit.
- Auth0/RBAC scaffolding.
- Initial editor ↔ API flows for projects/templates.

## 9. Support & Contributions
- Create feature branches per work item.
- Submit PRs targeting `master`; ensure lint/build scripts pass.
- Keep docs (`project_progress.md`, `user_manual.md`) updated when major behaviors change.
