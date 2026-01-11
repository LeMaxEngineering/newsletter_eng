# Project Progress Tracker

| Phase | Target Duration | Status | Key Outputs | Notes / Next Actions |
| --- | --- | --- | --- | --- |
| 0. Discovery & Architecture | 3 weeks | Complete | Monorepo bootstrapped, API health endpoint live, PRD (`docs/prd.md`), UX wireframes (`docs/wireframes.md`), architecture overview (`docs/architecture.md`) | Kick off Phase 1 handoff: finalize stakeholder alignment, schedule Phase 1 sprint planning. |
| 1. Core Editor & Auth | 6 weeks | In progress | React editor shell wired to shared UI kit, block schema package + catalog, user manual drafted, API dashboard + auth session wiring, RBAC guard + full project/template CRUD endpoints, SQLite-backed persistence with seeding, editor UI for block canvas + template management (create/update/delete + status), RBAC-aware nav/routes, API + web Vitest suites updated for DB layer | Next: Migrate from SQLite to managed Postgres, add E2E coverage, wire renderer tests + analytics milestones. |
| 2. Rendering & Preview | 5 weeks | Not started | AMP/HTML renderer, preview service, template mgmt APIs | Prototype renderer pipeline, set up Redis caching, integrate preview in editor. |
| 3. Engagement Pipeline & Analytics | 6 weeks | Not started | Ingestion service (NestJS + Kafka), warehouse models, analytics dashboard | Stand up Kafka topics, define event contracts, choose BI tool. |
| 4. ESP Integrations & Personalization | 5 weeks | Not started | Mailchimp/Sendgrid connectors, personalization rules engine | Build OAuth credential vault, implement segment targeting, add SDK docs. |
| 5. Beta Hardening & Launch | 4 weeks | Not started | QA sign-off, security review, billing tiers, documentation | Run load/security tests, finalize pricing, prepare onboarding material. |

## Additional Tracking
- **Testing KPIs**: Unit >80% coverage for critical packages; E2E suite green on main.
- **Operational KPIs**: Deployment pipeline <15 min, observability dashboards ready before Phase 3.
- **Risks Watchlist**: Email client compatibility, ESP API rate limits, data privacy obligations.
