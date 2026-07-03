<!--
Sync Impact Report:
- Version change: none -> 1.0.0
- Modified principles: Defined principles based on user constraints for Panoramex CRM
- Added sections: Core Principles, Stack Tecnológico Fijo, Governance
- Removed sections: N/A
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated)
  - .specify/templates/spec-template.md (✅ updated)
  - .specify/templates/tasks-template.md (✅ updated)
- Follow-up TODOs: None
-->

# Panoramex CRM & Chatbot Constitution

## Core Principles

### I. Seguridad Desde el Día Cero
Toda tabla en Supabase lleva Row Level Security (RLS) activa desde el primer commit que la crea, no después. Ninguna API key (OpenAI, Meta, Supabase service role) se expone jamás en código de frontend ni en el bundle de Vite. Todo llamado externo pasa por funciones serverless del backend en Vercel.

### II. Integraciones Reactivas y No Bloqueantes
El webhook de WhatsApp responde a Meta de forma rápida y sin loops largos ni bloqueantes dentro de la misma invocación serverless.

### III. Trazabilidad de Acciones Críticas
Toda función de escritura sensible (reasignar prospecto, editar precio de tour, pausar el sistema) queda registrada en una tabla de `audit_log` con el usuario responsable y la fecha exacta.

### IV. Calidad de Código Estricta
TypeScript estricto obligatorio en frontend y backend. Prohibido el uso de `any` salvo justificación explícita documentada en un comentario. Cada módulo se entrega con pruebas automatizadas de sus reglas de negocio críticas (estado de semáforo, ventana de 24h de WhatsApp, permisos de RLS) antes de darse por terminado. No es un MVP, cada módulo debe salir funcional, seguro y probado.

## Stack Tecnológico Fijo

El stack tecnológico es innegociable:
- Frontend: React + Vite + TypeScript + TailwindCSS + Zustand
- Backend: Funciones serverless de Node.js alojadas en Vercel
- Base de datos / Autenticación: Supabase (datos, auth, realtime)
- Integraciones: Integración directa con la Meta Cloud API (app propia en Meta for Developers, sin capas de orquestación intermedia como Make/Zapier)

## Governance

- Toda modificación al sistema debe adherirse a esta constitución y a sus principios de seguridad y calidad.
- Las enmiendas a estos principios requieren justificación arquitectónica o de negocio, especialmente respecto al stack innegociable.
- Los despliegues a producción se realizan asumiendo los más altos estándares de protección de datos de los prospectos y reservas.

**Version**: 1.0.0 | **Ratified**: 2026-07-03 | **Last Amended**: 2026-07-03
