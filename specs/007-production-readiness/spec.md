# Feature Specification: Preparación para Producción

**Feature Branch**: `007-production-readiness`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Preparar el sistema para producción real. Convertir el frontend en PWA instalable (manifest + service worker) para que los 7 colaboradores puedan "agregar a inicio" en su celular, tal como se confirmó en la demo. Estado de cuenta activo/pausado a nivel organización, controlable solo por admin, que detiene el consumo de API de Meta sin borrar datos ni configuración. Exportación completa de datos de la organización (los datos son de Panoramex). Rate limiting en todos los endpoints públicos del backend. Backups automáticos de Supabase verificados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Progressive Web App (PWA) (Priority: P1)

Como colaborador de Panoramex, quiero poder "Agregar a Inicio" la aplicación CRM en mi dispositivo móvil para acceder rápidamente como si fuera una aplicación nativa.

**Why this priority**: Los colaboradores necesitan acceso rápido y confiable desde dispositivos móviles durante sus operaciones y ventas en piso.

**Independent Test**: Can be fully tested by opening the site on a mobile device and verifying the "Add to Home Screen" prompt appears and the app launches standalone.

**Acceptance Scenarios**:

1. **Given** un dispositivo móvil compatible, **When** el usuario visita la URL de la aplicación web, **Then** el navegador ofrece la opción de instalar la PWA.
2. **Given** que la app está instalada, **When** el usuario abre la aplicación desde el icono de inicio, **Then** la aplicación se abre en modo "standalone" sin la barra de direcciones del navegador.

---

### User Story 2 - Pausar Actividad de Cuenta (Priority: P1)

Como Administrador, quiero poder pausar y reanudar temporalmente las operaciones de la cuenta a nivel organización para detener el consumo de la API de Meta sin perder información ni configuración.

**Why this priority**: Es una medida de control de costos y administración de crisis crítica para el entorno de producción.

**Independent Test**: Can be fully tested by having an Admin pause the account and verifying that no outgoing Meta API calls (webhooks or cron jobs) are executed, and users are notified of the paused state.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** cambia el estado de la cuenta a "Pausada" en los ajustes de organización, **Then** el sistema guarda el estado y muestra una alerta global de sistema pausado.
2. **Given** una cuenta en estado "Pausada", **When** se intenta enviar una campaña o responder un mensaje de WhatsApp, **Then** el sistema bloquea la acción para no consumir saldo de la API de Meta.

---

### User Story 3 - Exportación Completa de Datos (Priority: P2)

Como Administrador, quiero poder descargar una exportación completa de todos mis datos almacenados en el CRM (prospectos, interacciones, tours) para tener un respaldo en cumplimiento de la propiedad de datos.

**Why this priority**: Garantiza que el cliente (Panoramex) tiene control total sobre sus datos en cualquier momento.

**Independent Test**: Can be fully tested by clicking "Export Data" and downloading a zip/csv containing all organizational data.

**Acceptance Scenarios**:

1. **Given** un administrador en los ajustes de la organización, **When** solicita una exportación completa, **Then** el sistema genera y descarga un archivo estructurado con todos los registros relevantes.

---

### User Story 4 - Protección de Rate Limiting y Backups (Priority: P1)

Como Dueño del Sistema, quiero que las interfaces públicas del backend estén protegidas contra abusos y que los datos tengan respaldos automáticos verificables.

**Why this priority**: Seguridad e integridad de datos indispensables antes de operar en producción.

**Independent Test**: Can be fully tested by sending multiple requests to a public endpoint and verifying HTTP 429 Too Many Requests responses, and confirming the backup schedule in the Supabase dashboard.

**Acceptance Scenarios**:

1. **Given** un endpoint público (ej. Webhook de Meta), **When** recibe una alta ráfaga de peticiones en un corto periodo, **Then** el sistema aplica "Rate Limiting" rechazando las peticiones en exceso.
2. **Given** el proyecto de Supabase, **When** ocurren cambios diarios, **Then** se configuran o verifican respaldos automáticos por el proveedor de base de datos (Point in Time Recovery o Backups Diarios).

---

### Edge Cases

- ¿Qué sucede con los mensajes entrantes de WhatsApp si la cuenta está "Pausada"?
- ¿Cómo se maneja un archivo de exportación excesivamente grande para ser generado síncronamente?
- ¿Qué ocurre si usuarios legítimos de la PWA no tienen conexión temporalmente? (Se asume manejo básico de offline por Service Worker).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-PWA-001**: El frontend DEBE proveer un `manifest.json` válido con iconos (mínimo 192x192 y 512x512) y `display: standalone`.
- **FR-PWA-002**: El frontend DEBE registrar un Service Worker para cachear assets básicos y habilitar la instalación de PWA.
- **FR-ORG-001**: El sistema DEBE tener una tabla o registro de configuración global `organization_settings` con un campo booleano o enum para `system_status` (ej. `active` / `paused`).
- **FR-ORG-002**: La interfaz DEBE permitir a los roles Administradores conmutar el `system_status`.
- **FR-ORG-003**: El backend (Webhooks, Crons y endpoints de envío de mensajes) DEBE verificar el `system_status` y abortar silenciosa o explícitamente cualquier acción saliente si el estado es `paused`.
- **FR-EXP-001**: El sistema DEBE proporcionar una opción para exportar la información crítica (Prospectos, Reservaciones, Mensajes) en formatos estándar (CSV o JSON).
- **FR-SEC-001**: Los endpoints de Vercel (especialmente el Webhook de WhatsApp) DEBEN implementar lógica de limitación de tasa (Rate Limiting) basándose en IP o identificador de remitente.
- **FR-SEC-002**: Se DEBE documentar/verificar la configuración de respaldos automáticos (Backups) del proyecto en Supabase (Point-in-Time Recovery si está disponible en la capa de pago).

### Key Entities

- **Organization Settings**: Tabla/Registro único con el estado de operación de la cuenta (`status`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-PWA-001**: 100% de los colaboradores de pruebas pueden instalar el acceso directo en sus dispositivos móviles iOS/Android.
- **SC-ORG-001**: El cambio a estado "Pausado" detiene el 100% de los envíos a la API de Meta en menos de 10 segundos tras la confirmación.
- **SC-EXP-001**: La exportación completa genera un archivo válido descargable en menos de 60 segundos o mediante un proceso en segundo plano asíncrono si el volumen lo amerita.
- **SC-SEC-001**: Las pruebas de estrés (más de 100 req/s al webhook) resultan en limitación de tasa para proteger los recursos.

## Assumptions

- **Exportación Síncrona vs Asíncrona**: Se asume que para un volumen inicial, generar múltiples CSVs o JSON en el cliente o mediante Vercel Serverless (dentro del límite de 10-60 segundos de timeout) es factible.
- **Rate Limiting**: Se asume el uso de Edge Middleware o librerías de Vercel como `@upstash/ratelimit` junto a un Redis, o un control básico en memoria.
- **Backups**: Se asume que Panoramex cuenta con o activará el plan Pro de Supabase para respaldos automatizados o Point-in-Time Recovery garantizados.
