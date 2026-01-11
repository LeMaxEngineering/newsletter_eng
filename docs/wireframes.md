# UX Wireframes (Textual Spec)

## 1. Workspace Dashboard
- **Top Bar:** Tenant switcher, search, user menu with settings/logout.
- **Primary CTA:** "Create Project" button anchored top-right.
- **Project Cards:** Grid of projects (name, status, last updated, owner) with quick actions (Edit, Analytics, Archive).
- **Insights Panel:** Right rail chart showing latest engagement metrics + alerts (phase 3 tie-in).

## 2. Project Overview
- **Breadcrumb:** Home / Project / Overview.
- **Tabs:** Templates, Campaigns, Subscribers, Settings.
- **Templates Table:** Columns (Name, Version, Personalization, Last Modified, Actions).
- **Timeline Strip:** Shows recent renders/sends, links to analytics.
- **Secondary CTA:** "New Template" launches editor.

## 3. Template Editor
- **Left Rail:** Block library grouped by Interactive, Layout, Content. Drag to canvas.
- **Canvas:** Responsive page with section handles, inline editing (text, images, polls).
- **Right Rail:** Inspector with tabs (Content, Design, Personalization) exposing JSON schema-backed controls.
- **Preview Toggle:** Switch between Desktop, Mobile, AMP fallback.
- **Top Bar:** Template name, status chip, Save/Preview/Publish buttons, version indicator.

## 4. Personalization Rules Modal
- Wizard flow with steps: Select Segment → Choose Blocks → Define Conditions → Review.
- Shows live summary and conflict warnings.

## 5. Analytics Dashboard
- Filters for Project, Template, Date Range.
- KPI tiles (CTR, Completion rate, Render latency).
- Block performance table with sparkline per block.
- Download + Schedule buttons for exporting.

> Visual mocks to be produced in Figma; this document captures structure so engineers can proceed while design assets finalize.
