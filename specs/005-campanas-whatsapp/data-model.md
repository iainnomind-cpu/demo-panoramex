# Data Model & Interfaces: Campañas de WhatsApp

## Database Schema (Supabase)

### Tabla: `campaigns`
Registra las campañas maestras, tanto de envíos masivos únicos como de campañas automatizadas (ej. Cumpleaños, Encuestas).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, Default gen_random_uuid() | |
| `name` | TEXT | NOT NULL | Nombre interno de la campaña |
| `type` | TEXT | NOT NULL | `batch` (envío manual), `automated_birthday`, `automated_survey` |
| `template_name` | TEXT | NOT NULL | Nombre de la plantilla de Meta a usar |
| `status` | TEXT | NOT NULL | `draft`, `running`, `completed`, `paused` |
| `target_filters`| JSONB| NULL | Filtros usados para el segmento (si aplica) |
| `created_at` | TIMESTAMPTZ | Default now() | |
| `created_by` | UUID | FK -> `agents.id` | Agente creador |

### Tabla: `campaign_sends`
Registra a quién se le envió y el estatus individual. Permite sacar estadísticas.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, Default gen_random_uuid() | |
| `campaign_id`| UUID | FK -> `campaigns.id` | |
| `prospect_id`| UUID | FK -> `prospects.id`, NULL | Nulo si es un número externo y aún no ha respondido. Si el usuario pidió convertir externos, esto se mapeará al crear el prospecto. |
| `phone_number`| TEXT | NOT NULL | Número destino |
| `status` | TEXT | NOT NULL | `queued`, `sent`, `delivered`, `read`, `failed`, `replied` |
| `meta_message_id`| TEXT | NULL | ID devuelto por Meta API para cruzar webhooks |
| `created_at` | TIMESTAMPTZ | Default now() | |
| `updated_at` | TIMESTAMPTZ | Default now() | Actualizado por webhook |

### Tabla: `satisfaction_surveys`
Almacena los resultados de las encuestas post-tour.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, Default gen_random_uuid() | |
| `reservation_id`| UUID | FK -> `reservations.id`| |
| `prospect_id`| UUID | FK -> `prospects.id` | |
| `rating` | INTEGER| NOT NULL | Puntaje numérico (ej. 1 a 5) derivado del botón presionado |
| `feedback` | TEXT | NULL | Comentario adicional si el usuario lo envía después |
| `created_at` | TIMESTAMPTZ | Default now() | |

### Modificaciones a tablas existentes
- `prospects`: Agregar `birth_date` (DATE, nulo por defecto) para la automatización de cumpleaños.

## RLS Policies

1. **`campaigns`**:
   - `SELECT`: Autenticados (todos los agentes pueden ver el reporte de campañas).
   - `INSERT / UPDATE`: Autenticados (todos pueden crear campañas).
2. **`campaign_sends`**:
   - `SELECT`: Autenticados.
   - `INSERT / UPDATE`: El Service Role (backend Vercel) y el Webhook. Los agentes pueden insertar al crear lotes.
3. **`satisfaction_surveys`**:
   - `SELECT`: Autenticados.
   - `INSERT`: Service Role (vía Webhook de Meta).

## Interfaces (TypeScript)

A actualizar en `src/types/index.ts`:

```typescript
export interface Campaign {
  id: string
  name: string
  type: 'batch' | 'automated_birthday' | 'automated_survey'
  template_name: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  target_filters: Record<string, any> | null
  created_at: string
  created_by: string
}

export interface CampaignSend {
  id: string
  campaign_id: string
  prospect_id: string | null
  phone_number: string
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'replied'
  meta_message_id: string | null
  created_at: string
  updated_at: string
}

export interface SatisfactionSurvey {
  id: string
  reservation_id: string
  prospect_id: string
  rating: number
  feedback: string | null
  created_at: string
}
```

## Vercel Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/birthdays",
      "schedule": "0 15 * * *" 
    },
    {
      "path": "/api/cron/surveys",
      "schedule": "0 23 * * *" 
    }
  ]
}
```
*(Horarios en UTC: 15:00 UTC = 09:00 AM CST; 23:00 UTC = 17:00 PM CST)*
