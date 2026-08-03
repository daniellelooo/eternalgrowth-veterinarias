/**
 * Construye un link wa.me a partir del número guardado en clinic_settings.
 * Devuelve null si no hay número configurado, para que la UI pueda ocultar
 * el CTA de WhatsApp en vez de generar un link roto.
 */
export function buildWhatsAppLink(whatsapp: string | null, message?: string): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
