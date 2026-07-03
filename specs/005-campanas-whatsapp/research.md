# Research & Technical Decisions: Campañas de WhatsApp

## 1. Procesamiento de Archivos CSV de Gran Tamaño (10,000+ filas)

**Contexto**: El CRM debe cargar listas externas. Si subimos un CSV de 10,000 contactos directamente a un endpoint serverless de Vercel, podemos chocar con el límite de payload (4.5MB) o el timeout (10-60s).

**Decision**: Utilizar `PapaParse` en el Frontend (Navegador) para leer y parsear el archivo CSV.
**Rationale**: El navegador puede procesar un CSV de 10,000 filas en milisegundos. El frontend dividirá la lista en lotes (batches) de 500 contactos y hará múltiples llamadas secuenciales o paralelas controladas al endpoint `api/campaigns/send-batch.ts`. Esto evita saturar Vercel y sortea los límites de payload y timeout.
**Alternatives considered**: Subir el CSV a Supabase Storage y procesarlo asíncronamente en backend. Fue rechazado por ser más complejo; Vercel no soporta procesamiento en background largo sin usar servicios externos (como Inngest o Upstash), lo cual viola la restricción de stack.

## 2. Throttling de la API de Meta para envíos masivos

**Contexto**: Meta limita los envíos. Si Vercel manda 5,000 requests por segundo, Meta devolverá error 429 (Too Many Requests) o bloqueará la cuenta.

**Decision**: Controlar el rate limit desde el iterador de envío.
**Rationale**: Como usamos `send-batch.ts`, la función de Vercel recibirá un array (ej. 500 mensajes). Hará las peticiones a Meta secuencialmente o con un `Promise.all` limitado (usando algo como `p-limit` o chunks) para no exceder ~80 mensajes por segundo (límite estándar de Meta). Si ocurre un error 429, se aplicará retardo (backoff). 
**Alternatives considered**: Usar una cola de mensajes (Redis/RabbitMQ). Rechazado porque añade infraestructura fuera del stack innegociable. Supabase no tiene colas nativas simples fuera de `pg_cron` o `pg_net` que son complejas de orquestar.

## 3. Automatización (Cron Jobs)

**Contexto**: Necesitamos revisar cumpleaños diariamente y disparar mensajes, así como encuestas post-tour.

**Decision**: Usar Vercel Cron Jobs (`vercel.json`).
**Rationale**: Es la solución nativa del stack (Node.js en Vercel). Definiremos un cron en `vercel.json` que haga GET o POST a `api/cron/birthdays.ts` todos los días a las 09:00 AM. La función consultará a Supabase por prospectos que cumplan años hoy, y usará la lógica de envío de plantillas. Lo mismo para `api/cron/surveys.ts` a las 18:00 PM para los tours de ese día.
**Alternatives considered**: `pg_cron` dentro de Supabase haciendo llamadas HTTP a la Meta API mediante `pg_net`. Rechazado porque sacar la lógica de Node.js a SQL hace que perdamos la centralización del código de envío que ya existe en el webhook/API de Vercel.

## 4. Estructura de Encuestas de Satisfacción

**Contexto**: La especificación requiere `satisfaction_surveys` como tabla separada. El cliente presiona un botón (ej. "5 estrellas") en WhatsApp y eso se guarda.

**Decision**: El webhook actual de Meta (Fase 3) se actualizará para detectar cuando la respuesta (Payload de botón de WhatsApp) corresponde a una encuesta.
**Rationale**: Los botones de WhatsApp pueden tener un payload (ej. `SURVEY_5_STARS_RES_ID_123`). El webhook intercepta ese payload, extrae el `reservation_id`, y hace un `INSERT/UPDATE` en la tabla `satisfaction_surveys`.
**Alternatives considered**: Enviar links a Typeform/Google Forms. Rechazado por instrucción directa del usuario ("vía botones de WhatsApp").
