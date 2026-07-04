// Rate limiter simple en memoria para proteger endpoints en Vercel
// Dado que las funciones serverless de Vercel (Edge o Node) pueden reutilizar instancias 
// entre invocaciones (warm starts), un Map en memoria es una forma básica
// y gratuita de implementar Rate Limiting (sin requerir Redis).
// Para un entorno de producción masivo, se recomienda @upstash/ratelimit.

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitTracker>();

export function checkRateLimit(ipOrId: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(ipOrId);

  // Limpieza ocasional (lazy)
  if (record && now > record.resetAt) {
    store.delete(ipOrId);
  }

  const current = store.get(ipOrId);

  if (!current) {
    store.set(ipOrId, { count: 1, resetAt: now + windowMs });
    return true; // OK
  }

  if (current.count >= limit) {
    return false; // Rate limit excedido
  }

  current.count++;
  return true; // OK
}
