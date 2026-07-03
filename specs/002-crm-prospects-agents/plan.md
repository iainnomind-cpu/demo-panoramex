# Implementation Plan: CRM Prospects & Agents

**Branch**: `[002-crm-prospects-agents]` | **Date**: 2026-07-03 | **Spec**: [spec.md](file:///c:/Users/redi_/Downloads/panoramex-crm/specs/002-crm-prospects-agents/spec.md)

**Input**: Feature specification from `/specs/002-crm-prospects-agents/spec.md`

## Summary

Build the core CRM Prospects & Agents module by extending the foundational Supabase database with advanced prospect fields and an interactions timeline. Migrate the existing Kanban and 360 Profile React components from local mock data to Supabase Realtime subscriptions, enabling live drag-and-drop state syncing between agents. Enforce strict Constitution principles: open read access for all agents, but restrictive RLS preventing unauthorized reassignment. Calculate dynamic traffic lights and inactivity alerts on the frontend to avoid heavy backend polling.

## Technical Context

**Language/Version**: TypeScript (React 19, Vite, Node.js)

**Primary Dependencies**: React Query, Supabase JS, Zustand, TailwindCSS

**Storage**: Supabase PostgreSQL

**Testing**: Manual via quickstart scenarios

**Target Platform**: Web application (Vercel)

**Project Type**: Web application (CRM)

**Performance Goals**: Realtime UI sync under 2s latency.

**Constraints**: API keys must remain strictly backend-only. Supabase Realtime must be used for Kanban updates.

**Scale/Scope**: Dozens of concurrent agents; thousands of active prospects.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Supabase RLS is configured for all new tables.
- [x] No API keys are exposed in frontend code; all external calls go through Vercel serverless functions.
- [x] WhatsApp webhook responds fast and without blocking loops (Not directly applicable, but Round-Robin assignment will be designed efficiently).
- [x] Sensitive write operations are tracked in `audit_log` (Reassignment already logs to audit).
- [x] TypeScript is strictly used (`any` only if documented).
- [x] Automated tests for critical business logic are planned (Covered by quickstart validation scenarios).
- [x] Stack strictly adheres to: React+Vite+TS+Tailwind+Zustand, Node.js (Vercel), Supabase, Meta Cloud API direct integration.

## Project Structure

### Documentation (this feature)

```text
specs/002-crm-prospects-agents/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
api/
└── admin/
    └── reassign-prospect.ts (Update to handle extended prospect fields if needed)

src/
├── components/
│   └── shared/
│       ├── KanbanBoard.tsx (Update to use Supabase Realtime)
│       └── Prospect360Modal.tsx (Update to fetch real interactions timeline)
├── hooks/
│   └── useProspects.ts (Extend for Realtime subscriptions and traffic light logic)
└── types/
    └── index.ts (Update Prospect and Interaction interfaces)

supabase/
└── migrations/
    └── 00001_crm_prospects_extension.sql (New migration for tables and RLS)
```

**Structure Decision**: Web application with backend serverless functions. The existing `api/` and `src/` directories will be utilized exactly as outlined.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
