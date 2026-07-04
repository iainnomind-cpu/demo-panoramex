# Data Model & Interfaces: Preparación para Producción

## Entidades de Base de Datos (Supabase)

### Tabla: `organization_settings`
Almacena la configuración global de la instancia del CRM. Solo contendrá una fila por defecto.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | uuid | PK, Default `uuid_generate_v4()` | Identificador. |
| `system_status` | text | Default `'active'` | Puede ser `'active'` o `'paused'`. |
| `updated_at` | timestamptz | Default `now()` | Última actualización. |
| `updated_by` | uuid | FK -> auth.users | Administrador que cambió el estado. |

**RLS (Row Level Security):**
- **Select**: Público para usuarios autenticados.
- **Update**: Solo para usuarios con rol `admin` (determinado por metadatos o tabla `agents.role == 'admin'`).

## Interfaces / Endpoints Modificados

### Webhook de WhatsApp (`POST /api/webhook/whatsapp`)
- **Lógica inyectada:**
  1. Rate Limiter Check (IP o remito del request).
  2. Obtener `system_status` desde Supabase.
  3. Si `system_status == 'paused'`, registrar en log, retornar `200 OK` (para que Meta no reintente) y abortar la propagación de mensajes o respuestas automatizadas.
