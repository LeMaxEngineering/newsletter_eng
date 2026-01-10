# Database & Data Model Structure

The platform uses PostgreSQL for transactional data and a warehouse (BigQuery/Snowflake) for analytics. Below are the primary relational entities, relationships, and supporting warehouse models.

## Core Relational Tables (PostgreSQL)
| Table | Key Fields | Description |
| --- | --- | --- |
| `tenants` | `id`, `name`, `plan`, `billing_status`, `created_at` | SaaS tenants/customers; drives billing tiers and limits. |
| `users` | `id`, `tenant_id`, `email`, `role`, `status`, `mfa_config` | Collaborators within tenants; ties into RBAC. |
| `projects` | `id`, `tenant_id`, `name`, `status`, `default_locale` | Logical grouping for newsletter campaigns/templates. |
| `templates` | `id`, `project_id`, `version`, `block_tree` (JSONB), `is_published` | Stores block schema definitions with versioning. |
| `personalization_rules` | `id`, `project_id`, `segment_id`, `target_block_ids`, `conditions` (JSONB) | Controls which blocks render per segment. |
| `campaigns` | `id`, `project_id`, `template_id`, `esp_id`, `send_window`, `status` | Outbound sends referencing templates and ESP accounts. |
| `esp_accounts` | `id`, `tenant_id`, `provider`, `oauth_meta`, `status` | OAuth credentials + metadata per ESP integration. |
| `render_jobs` | `id`, `campaign_id`, `status`, `render_type`, `output_hash`, `created_at`, `completed_at` | Tracks AMP/HTML rendering tasks and cache keys. |
| `events_interactions` | `id`, `campaign_id`, `subscriber_id`, `block_id`, `event_type`, `payload`, `occurred_at` | Raw interaction events (ingested first in Kafka, persisted for audit/BI). |
| `subscribers` | `id`, `tenant_id`, `email`, `locale`, `attributes` (JSONB), `consent_state` | Subscriber profiles + consent metadata. |
| `segments` | `id`, `tenant_id`, `name`, `definition` (JSONB) | Dynamic audience definitions used by personalization rules. |
| `webhooks` | `id`, `tenant_id`, `url`, `event_types`, `secret`, `is_active` | Outbound automation triggers to third-party systems. |
| `audit_logs` | `id`, `tenant_id`, `actor_id`, `action`, `target`, `metadata`, `created_at` | Compliance logging for key actions (RBAC governance). |

### Relationships
- `tenants` 1..n `users`, `projects`, `esp_accounts`, `subscribers`, `segments`.
- `projects` 1..n `templates`, `campaigns`, `personalization_rules`.
- `campaigns` reference `templates`, `esp_accounts`, and enqueue `render_jobs`.
- `events_interactions` reference `campaigns` + `subscribers` (+ optional `block_id` for granular analytics).

### Indexing & Performance
- B-tree indexes on foreign keys (`*_id`) and frequently filtered fields (`campaign_id`, `occurred_at`, `tenant_id`).
- GIN indexes on JSONB columns (`block_tree`, `conditions`, `attributes`) for targeted queries.
- Partition `events_interactions` by month to keep insert/query performance stable.

## Warehouse Models (dbt)
| Model | Source | Purpose |
| --- | --- | --- |
| `stg_events_interactions` | Kafka → landing tables | Captures raw events for validation. |
| `fct_engagements` | `events_interactions`, `campaigns`, `templates` | Fact table aggregating interactions per block, device, locale. |
| `dim_campaigns` | `campaigns`, `projects`, `tenants` | Dimension for campaign metadata and hierarchy. |
| `dim_subscribers` | `subscribers`, `segments` | Subscriber attributes, consent states, segment membership snapshots. |
| `agg_block_performance` | Derived from `fct_engagements` | Materialized view powering analytics heatmaps and alerts. |
| `agg_tenant_health` | Mix of facts/dims | KPIs per tenant (CTR uplift, deliverability, latency). |

## Data Flow Summary
1. **Creation Time:** Templates/block schemas stored in PostgreSQL (`templates.block_tree`).
2. **Rendering:** Renderer pulls template + personalization rules, writes `render_jobs` status, caches outputs in Redis.
3. **Send/Engagement:** Interaction events captured via ingestion service → Kafka → persisted to `events_interactions` and replicated to warehouse.
4. **Analytics:** dbt transforms feed dashboards + alerting services; `agg_block_performance` drives editor-side insights.

## Compliance & Governance
- Subscriber consent tracked in `subscribers.consent_state` with `audit_logs` capturing updates (for GDPR/CCPA).
- DSR (data subject request) workflows rely on foreign-key cascades and soft-delete flags (not shown) to ensure traceability.
- PII encryption at rest enforced via PostgreSQL column-level encryption or application-layer secrets management.
