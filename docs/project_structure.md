# Project Structure

## High-Level Layout
```
neewsletterengine/
├── apps/
│   ├── web/                     # React + Vite newsletter editor and analytics UI
│   └── api/                     # NestJS API gateway (editor, rendering, engagements)
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
│   └── dashboards/              # Metabase/Superset definitions & exports
├── infra/
│   ├── terraform/               # IaC modules for core resources
│   └── k8s/                     # Helm charts / manifests for services
├── scripts/                     # Developer tooling, scaffolding, CLI helpers
├── docs/                        # Architecture + planning docs (current folder)
├── .github/workflows/           # CI/CD pipelines (lint, test, deploy)
└── package.json / pnpm-workspace.yaml
```

## Notes & Rationale
1. **apps/** hosts product-facing applications. `web` consumes GraphQL APIs, `api` orchestrates business logic (projects, templates, auth, personalization) per roadmap Phase 1–2.
2. **services/** isolates background workloads (rendering, ingestion, ESP sync) so they can scale independently for latency-sensitive tasks (Phase 2–4).
3. **packages/** centralizes reusable code to keep the monorepo DRY: UI kit for consistent editor styling, block schema definitions shared between web, API, and renderer, and shared configs for tooling.
4. **data/** aligns with analytics workstream (Phase 3), storing dbt models and BI artifacts under version control.
5. **infra/** covers Terraform + Kubernetes/Helm assets, matching IaC + observability requirements in the development plan.
6. **scripts/** and **.github/** handle automation: scaffolding generators, lint/test commands, CI/CD workflows for unit, integration, and E2E pipelines described in the testing strategy.
