# Implementation Plan: Chatbot IA Multicanal

**Branch**: `003-ai-chatbot-multicanal` | **Date**: 2026-07-03 | **Spec**: [spec.md](file:///c:/Users/redi_/Downloads/panoramex-crm/specs/003-ai-chatbot-multicanal/spec.md)

**Input**: Feature specification from `/specs/003-ai-chatbot-multicanal/spec.md`

## Summary

Construir un chatbot de IA multicanal (inicialmente WhatsApp) con la API de OpenAI, alojado en funciones serverless de Vercel. El webhook responderá a Meta de inmediato e insertará el evento en Supabase (`webhook_events`) para procesamiento asíncrono usando `waitUntil` (o manejador de eventos), garantizando alta disponibilidad, seguridad de claves y un flujo rápido para el usuario sin bloqueos largos.

**Cumplimiento y Escalabilidad**: El diseño incorpora protección estricta contra spam (reintentos con backoff exponencial si la API de Meta devuelve rate limits), manejo automatizado de Opt-outs (pausando el bot e inhibiendo mensajes automáticos cuando el usuario envía "STOP"), y respeto riguroso a la ventana de 24 horas usando plantillas pre-aprobadas y un margen de seguridad de 5 minutos en cronjobs de re-enganche.

## Technical Context

**Language/Version**: TypeScript 5+

**Primary Dependencies**: `openai`, `supabase-js`, `crypto` (built-in Node)

**Storage**: PostgreSQL (Supabase) con tablas adicionales para mensajería y webhooks

**Testing**: Webhook local testing via curl, unit testing para el flujo de estado

**Target Platform**: Vercel Serverless Functions (Node.js)

**Project Type**: Serverless Backend API / Chatbot

**Performance Goals**: Webhook HTTP 200 response < 3s (p95)

**Constraints**: Strict 24-hour Meta window policy, no API keys on frontend, high security (RLS)

**Scale/Scope**: ~100 concurrent conversations, high volume handling without message loss

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Supabase RLS is configured for all new tables.
- [x] No API keys are exposed in frontend code; all external calls go through Vercel serverless functions.
- [x] WhatsApp webhook responds fast and without blocking loops.
- [x] Sensitive write operations are tracked in `audit_log`.
- [x] TypeScript is strictly used (`any` only if documented).
- [x] Automated tests for critical business logic are planned.
- [x] Stack strictly adheres to: React+Vite+TS+Tailwind+Zustand, Node.js (Vercel), Supabase, Meta Cloud API direct integration.

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-chatbot-multicanal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
api/
├── webhook/
│   └── whatsapp.ts      # Vercel serverless function entrypoint
├── bot/
│   ├── flows/           # Configurations per tour
│   ├── llm.ts           # OpenAI integrations
│   └── state.ts         # Conversation state machine

src/lib/
├── database.types.ts    # Extended with new tables

supabase/migrations/
└── 00002_chatbot_schema.sql
```

**Structure Decision**: Usaremos la carpeta `api/` nativa de Vercel para alojar los endpoints serverless, manteniendo el código del bot modularizado en `api/bot/`.
