# Research & Technical Decisions: Preparación para Producción

## 1. PWA con Vite
- **Decision**: Utilizar `vite-plugin-pwa` para generar automáticamente el Web Manifest y el Service Worker básico.
- **Rationale**: Es el estándar en el ecosistema Vite, minimiza el código boilerplate y permite configuración rápida de Workbox para caché de assets en caso de conexión inestable, cumpliendo el requisito de "Agregar a Inicio" con poco esfuerzo.
- **Alternatives considered**: Escribir el `manifest.json` y el `service-worker.js` a mano. Descartado por mantenimiento complejo.

## 2. Rate Limiting en Vercel
- **Decision**: Implementar Rate Limiting básico en memoria (Map) en los Vercel Serverless Functions para proteger contra bursts.
- **Rationale**: Dado que Vercel Functions pueden compartir variables en estado global durante su ciclo de vida (warm start), se puede usar un simple Map con timestamps para rechazar requests en ráfaga desde la misma IP. No requiere infraestructura extra (Redis).
- **Alternatives considered**: `@upstash/ratelimit`. Descartado temporalmente para no forzar la creación de una base de datos Redis externa al cliente, aunque sería la solución ideal a largo plazo.

## 3. Estado de Cuenta (Activo/Pausado)
- **Decision**: Crear la tabla `organization_settings` con una única fila `id=1` (y RLS asegurando que solo el rol de admin pueda modificarla). El webhook consultará este valor en caché o base de datos.
- **Rationale**: Simple, centralizado y aprovechando Supabase. Se puede usar caché (SWR) en Vercel para no ahogar a Supabase en cada request del webhook, pero dado que es tráfico moderado, un select directo con RLS ignorado en el service role es rápido.
- **Alternatives considered**: Variable de entorno en Vercel. Descartado porque requiere redesplegar la app o usar la API de Vercel para pausar el sistema, limitando al administrador del CRM en la UI.

## 4. Exportación Completa
- **Decision**: Realizar la exportación completamente desde el cliente (Frontend) haciendo paginación en Supabase y ensamblando CSVs o JSON localmente, empaquetándolos con JSZip si es necesario, o un simple archivo JSON.
- **Rationale**: Evita el problema del límite de ejecución de 10s o 60s en Vercel. El cliente puede mostrar progreso mientras descarga los prospectos y conversaciones y genera el Blob.
- **Alternatives considered**: Función Serverless en Vercel. Riesgo altísimo de Timeout si la base de datos de Panoramex crece a miles de interacciones.

## 5. Backups Automáticos
- **Decision**: Validar PITR o Backups diarios en el dashboard de Supabase (Acción Manual).
- **Rationale**: Supabase ya maneja respaldos automáticos en todos sus planes. No hay código que escribir, solo incluirlo como un checklist de paso a producción.
