# Interactive Newsletter Engine

Monorepo for the interactive newsletter platform described in the development plan. It houses the React editor/analytics UI, NestJS API, background services, shared packages, data models, and infrastructure definitions.

## Tech Stack
- **Frontend:** React + TypeScript (Vite), Tailwind-ready via shared UI kit
- **Backend:** NestJS (Node.js + TypeScript) for APIs and services
- **Data & Messaging:** PostgreSQL, Redis, Kafka (planned), dbt for analytics
- **Tooling:** pnpm workspaces, ESLint, Prettier, GitHub Actions CI

## Getting Started
```bash
pnpm install
pnpm dev:web       # Runs the React editor dev server
pnpm dev:api       # Starts the NestJS API in watch mode
```

## Repository Layout
See `docs/project_structure.md` for a detailed directory breakdown and `docs/development-plan.md` for roadmap context.
