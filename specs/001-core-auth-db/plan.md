# Implementation Plan: Core Auth & DB

**Branch**: `001-core-auth-db` | **Date**: 2026-07-03 | **Spec**: [spec.md](../spec.md)

**Input**: Feature specification from `specs/001-core-auth-db/spec.md`

## Summary

Build the foundational database schema (agents, org_settings, audit_log), Supabase authentication for 7 users, role-based access control (admin vs agent), and migrate the existing frontend mock data to real Supabase API calls. Secure endpoints needing `service_role` will use Vercel Serverless Functions in `/api`.

## Technical Context

**Language/Version**: Node.js 18+ (Vercel Serverless), TypeScript 5+ (Frontend/Backend)

**Primary Dependencies**: React, Vite, TailwindCSS, Zustand, Supabase JS Client, React-Query (or SWR) for data fetching/caching

**Storage**: Supabase Postgres

**Testing**: Jest / React Testing Library (Frontend), Jest (Backend/Serverless)

**Target Platform**: Vercel (Frontend & Serverless Functions), Supabase (Database & Auth)

**Project Type**: Web Application & Serverless API

**Performance Goals**: Fast UI response for prospect data loading; non-blocking webhook processing

**Constraints**: Security: Row Level Security (RLS) required on all tables. No API keys exposed in frontend.

**Scale/Scope**: 7 initial users (5 agents, 2 admins). Baseline for CRM modules.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Supabase RLS is configured for all new tables. (Will be in schema)
- [x] No API keys are exposed in frontend code; all external calls go through Vercel serverless functions. (Architecture adheres to this)
- [x] WhatsApp webhook responds fast and without blocking loops. (N/A for this specific feature but architecture supports it)
- [x] Sensitive write operations are tracked in `audit_log`. (Included in schema and endpoints)
- [x] TypeScript is strictly used (`any` only if documented). (Will be enforced)
- [x] Automated tests for critical business logic are planned. (Included in tasks)
- [x] Stack strictly adheres to: React+Vite+TS+Tailwind+Zustand, Node.js (Vercel), Supabase, Meta Cloud API direct integration. (Yes)

## Project Structure

### Documentation (this feature)

```text
specs/001-core-auth-db/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (generated later)
```

### Source Code (repository root)

```text
api/                     # Vercel Serverless Functions
├── auth/
├── admin/
└── webhooks/

src/                     # React Frontend
├── components/
├── hooks/
├── pages/
├── store/
└── lib/

supabase/                # Database configuration
├── migrations/
└── seed.sql
```

**Structure Decision**: The frontend exists in the current repo, and we will add an `api/` folder at the root for Vercel serverless functions, along with a `supabase/` folder for DB migrations.
