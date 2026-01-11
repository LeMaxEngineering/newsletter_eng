# Project Structure

## High-Level Layout
```
neewsletterengine/
├── apps/
│   ├── web/                     # React + Vite newsletter editor and analytics UI
│   └── api/                     # NestJS API gateway (health, editor, rendering, engagements)
├── services/
│   ├── renderer/                # Specialized rendering workers (AMP/HTML generation)
│   ├── ingestion/               # Event ingestion + Kafka producers
│   └── integrations/            # ESP connector workers & schedulers
├── packages/
│   ├── ui-kit/                  # Shared UI components & Tailwind config
│   ├── block-schema/            # JSON schemas, validators, type defs
│   └── config/                  # Shared tsconfig/eslint/prettier settings
├── data/
│   ├── dbt/                     # Transform models + tests for warehouse
│   ├── dashboards/              # Metabase/Superset definitions & exports
│   ├── projects.json            # Seed data for initial project/template records
│   └── newsletter.db            # SQLite file used by the API in Phase 1 persistence
├── infra/
│   ├── terraform/               # IaC modules for core resources
│   └── k8s/                     # Helm charts / manifests for services
├── scripts/                     # Developer tooling, scaffolding, CLI helpers
├── docs/                        # Architecture + planning docs (current folder, includes PRD/wireframes)
├── .github/workflows/           # CI/CD pipelines (lint, test, deploy)
└── package.json / pnpm-workspace.yaml
```

## Notes & Rationale
1. **apps/** hosts product-facing applications. `web` consumes GraphQL APIs, `api` orchestrates business logic (projects, templates, auth, personalization) per roadmap Phase 1–2.
2. **services/** isolates background workloads (rendering, ingestion, ESP sync) so they can scale independently for latency-sensitive tasks (Phase 2–4).
3. **packages/** centralizes reusable code to keep the monorepo DRY: UI kit for consistent editor styling, block schema definitions shared between web, API, and renderer, and shared configs for tooling.
4. **data/** now includes both legacy JSON seeds and the SQLite database (`newsletter.db`) that backs the NestJS API during Phase 1. This keeps local persistence self-contained while we prep for PostgreSQL migration.
5. **infra/** covers Terraform + Kubernetes/Helm assets, matching IaC + observability requirements in the development plan.
6. **scripts/** and **.github/** handle automation: scaffolding generators, lint/test commands, CI/CD workflows for unit, integration, and E2E pipelines described in the testing strategy.
7. **docs/prd.md** captures Phase 0 product requirements; additional wireframes + diagrams land here.
