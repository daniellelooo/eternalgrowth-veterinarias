import "server-only";
import type { NextRequest } from "next/server";

/**
 * Notifica un evento a n8n vía webhook saliente. Nunca lanza: si falla la
 * petición (o no hay N8N_WEBHOOK_URL configurada), se resuelve en silencio.
 */
export async function notifyN8n(event: string, payload: unknown): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload, sentAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Silencioso: la notificación a n8n nunca debe romper el flujo principal.
  }
}

/**
 * Verifica el header Authorization: Bearer <N8N_API_KEY> en las rutas
 * entrantes que consume n8n. Devuelve false si falta o no coincide.
 */
export function requireN8nAuth(req: NextRequest): boolean {
  const expected = process.env.N8N_API_KEY;
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token === expected;
}
