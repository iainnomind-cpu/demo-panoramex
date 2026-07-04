/**
 * rateLimit.ts — Panoramex CRM
 *
 * Rate limiter persistente usando Supabase (tabla rate_limit_buckets).
 * Utiliza ventanas de tiempo fijas con upsert atómico.
 *
 * Estrategia: Fixed Window Counter
 *   - Por cada key (ej: "ip:123.45.67.89"), se crea un bucket por ventana de tiempo.
 *   - Si el contador alcanza el límite, se rechaza la petición.
 *   - Los buckets expirados se limpian con la función cleanup_rate_limit_buckets().
 *
 * Uso:
 *   const { allowed } = await checkRateLimit(adminDb, 'ip:1.2.3.4', 50, 10_000)
 *   if (!allowed) return new Response('Too Many Requests', { status: 429 })
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

/**
 * Comprueba y registra una petición en el rate limiter persistente.
 *
 * @param db        - Cliente Supabase con permisos de service_role (adminDb)
 * @param key       - Identificador único (ej: `ip:${ip}`, `phone:${phone}`)
 * @param limit     - Número máximo de peticiones permitidas en la ventana
 * @param windowMs  - Tamaño de la ventana en milisegundos (ej: 10_000 = 10 seg)
 * @returns         - { allowed, count, limit }
 */
export async function checkRateLimit(
  db: SupabaseClient<Database>,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  // Calcular el inicio de la ventana actual (truncar al múltiplo de windowMs)
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs).toISOString();

  // Intentar insertar. Si ya existe el bucket, incrementar el contador atómicamente.
  const { data, error } = await db.rpc('upsert_rate_limit', {
    p_key: key,
    p_window_start: windowStart,
    p_limit: limit,
  });

  if (error) {
    // En caso de error de BD, fail-open (permitir la petición) para no bloquear el servicio
    console.error('[RateLimit] Supabase error, failing open:', error.message);
    return { allowed: true, count: 0, limit };
  }

  const result = data as unknown as { count: number; allowed: boolean };
  return {
    allowed: result.allowed,
    count: result.count,
    limit,
  };
}
