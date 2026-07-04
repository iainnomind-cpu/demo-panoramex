# Implementation Plan: Analytics Dashboard

**Branch**: `006-analytics-dashboard` | **Date**: 2026-07-03 | **Spec**: [spec.md](file:///c:/Users/redi_/Downloads/panoramex-crm/specs/006-analytics-dashboard/spec.md)

**Input**: Feature specification from `/specs/006-analytics-dashboard/spec.md`

## Summary

The Analytics Dashboard will replace simulated Recharts data with real-time, aggregated data from the CRM modules. To ensure high performance and low frontend payload, all aggregations (KPIs, funnels, conversion rates by agent/channel/tour, and bot qualification vs human handoff) will be computed in PostgreSQL via Supabase Views and RPCs. The frontend will fetch these pre-aggregated datasets and map them to the existing Recharts components. Client-side PDF/Excel export will be implemented using libraries like `jspdf` and `xlsx`.

## Technical Context

**Language/Version**: TypeScript (React 18 + Node.js)

**Primary Dependencies**: Supabase JS Client, Recharts, jsPDF (for PDF export), xlsx (for Excel export)

**Storage**: PostgreSQL (Supabase) via Views and RPCs

**Testing**: Manual E2E validation against live Supabase data

**Target Platform**: Web application (Frontend: Vite, Backend: Vercel serverless / Supabase RPCs)

**Project Type**: Web application

**Performance Goals**: Dashboard loads under 2s; real-time KPI updates within 3s.

**Constraints**: Do not perform heavy data joins/aggregations on the client. Use Supabase database logic.

**Scale/Scope**: Aggregating data across ~12 months for 10s of agents and 1000s of prospects/messages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Supabase RLS is configured for all new tables. (N/A - using Views/RPCs, which respect underlying RLS).
- [x] No API keys are exposed in frontend code; all external calls go through Vercel serverless functions.
- [x] WhatsApp webhook responds fast and without blocking loops. (N/A)
- [x] Sensitive write operations are tracked in `audit_log`. (N/A - dashboard is read-only).
- [x] TypeScript is strictly used (`any` only if documented).
- [x] Automated tests for critical business logic are planned. (Manual E2E for UI).
- [x] Stack strictly adheres to: React+Vite+TS+Tailwind+Zustand, Node.js (Vercel), Supabase, Meta Cloud API direct integration.

## Project Structure

### Documentation (this feature)

```text
specs/006-analytics-dashboard/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── Analytics/
│       ├── index.tsx          # Main dashboard view
│       ├── KpiCards.tsx       # Real-time KPIs
│       ├── FunnelChart.tsx    # Sales Funnel Recharts component
│       ├── ConversionCharts.tsx # Agent/Channel/Tour reports
│       ├── BotPerformance.tsx # Bot vs Human handoff
│       └── ExportPanel.tsx    # PDF/Excel export controls
├── store/
│   └── useAnalyticsStore.ts   # Zustand store fetching from Supabase Views/RPCs
├── types/
│   └── index.ts               # Updated types for analytics responses

supabase/
└── migrations/
    └── 00005_analytics_views.sql # Migration for Views and RPCs
```

**Structure Decision**: The frontend code will reside in `src/pages/Analytics` with state management in `src/store/useAnalyticsStore.ts`. The heavy lifting is contained in `supabase/migrations/00005_analytics_views.sql`.
