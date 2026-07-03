---
description: "Requirements quality validation for Core Auth, Data Migration, and Error Recovery"
---

# Checklist: Data, Auth & Resilience Requirements

**Purpose**: Unit test the requirements in `spec.md` to ensure clarity, completeness, and consistency before implementation.
**Focus**: Functional rules, Data/Auth layer logic, Security (RLS), and Error Recovery scenarios.

## Requirement Completeness & Coverage

- [ ] CHK001 - Are data migration requirements specified for all entities mentioned, including "conversations"? [Completeness, Gap]
- [ ] CHK002 - Is the behavior and validation for the `can_edit_catalog` flag explicitly detailed in the requirements? [Completeness, Spec §FR-004]
- [ ] CHK003 - Are the data relationships between `agents` and `prospects` explicitly defined in the data model requirements? [Completeness]

## Security & Constitution Alignment

- [ ] CHK004 - Are Row Level Security (RLS) policies explicitly and comprehensively defined for all new tables (`agents`, `org_settings`, `audit_log`, `prospects`)? [Completeness, Spec §FR-SEC-001]
- [ ] CHK005 - Is it explicitly documented which environment variables are exposed to the Vite frontend vs strictly held securely in Vercel? [Clarity, Spec §FR-SEC-002]
- [ ] CHK006 - Are the required fields and schema for the `audit_log` (e.g., user, timestamp, action type, target entity) clearly defined for sensitive actions? [Clarity, Spec §FR-AUD-001]

## Requirement Consistency & Clarity

- [ ] CHK007 - Is the definition of "standard agent" vs "admin" consistently applied across all data access and mutation rules? [Consistency, Spec §FR-002]
- [ ] CHK008 - Are the specific data conditions that trigger the "System Paused" state objectively defined? [Clarity, Spec §FR-003]
- [ ] CHK009 - Do the data layer requirements clearly state the caching/invalidation strategy (e.g., React Query behavior) after a prospect is reassigned? [Completeness, Gap]

## Error Recovery & Resilience

- [ ] CHK010 - Are recovery flows explicitly defined for when a Serverless function (e.g., `reassign-prospect`) fails halfway (e.g., updates the prospect but fails to write to `audit_log`)? [Exception Flow, Gap]
- [ ] CHK011 - Is the fallback or retry behavior specified for when the Supabase client encounters a network timeout during a critical read/write? [Exception Flow, Gap]
- [ ] CHK012 - Does the spec define how the system should recover if the user's session token expires precisely during an active admin operation? [Recovery, Gap]
- [ ] CHK013 - Are requirements defined for handling race conditions (e.g., two admins attempting to reassign the same prospect simultaneously)? [Edge Case, Gap]
