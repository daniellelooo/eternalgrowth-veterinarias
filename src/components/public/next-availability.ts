import "server-only";
import { addDays } from "date-fns";
import { getAvailableSlotsForDate, toBogotaDateISO } from "@/lib/data/availability";
import type { Service } from "@/lib/types";

export interface NextAvailabilitySlot {
  iso: string;
  label: string;
}

export interface NextAvailability {
  dateLabel: string;
  slots: NextAvailabilitySlot[];
}

const LOOKAHEAD_DAYS = 7;
const MAX_SLOTS_SHOWN = 4;
const BOGOTA_TZ = "America/Bogota";

function formatTimeLabel(iso: string): string {
  const parts = new Intl.DateTimeFormat("es-CO", {
    timeZone: BOGOTA_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso));

  const hour = parts.find((p) => p.type === "hour")?.value ?? "12";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const period = /p/i.test(parts.find((p) => p.type === "dayPeriod")?.value ?? "a. m.") ? "p.m." : "a.m.";
  return `${hour}:${minute} ${period}`;
}

function formatDateLabel(dateISO: string, dayOffset: number): string {
  if (dayOffset === 0) return "Hoy";
  if (dayOffset === 1) return "Mañana";

  // dateISO ya es la fecha correcta en tz Bogotá; se formatea en UTC neutro
  // (misma Y-M-D) para no reintroducir un desplazamiento de zona horaria.
  const [y, m, d] = dateISO.split("-").map(Number);
  const neutral = new Date(Date.UTC(y, m - 1, d, 12));
  const weekday = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: "UTC" }).format(neutral);
  const month = new Intl.DateTimeFormat("es-CO", { month: "long", timeZone: "UTC" }).format(neutral);
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} ${d} de ${month}`;
}

/**
 * Busca el próximo día (dentro de una ventana de 7 días) con cupos
 * disponibles para el primer servicio activo, y devuelve hasta 4 horarios
 * formateados para mostrar en el hero. Se detiene en el primer día con
 * disponibilidad; en la mayoría de los días esto es una sola consulta.
 * Devuelve null si no hay cupos en la ventana (agenda llena o servicio
 * inexistente), para que la UI pueda mostrar un estado alternativo.
 */
export async function getNextAvailability(service: Service | undefined): Promise<NextAvailability | null> {
  if (!service) return null;

  const today = new Date();
  for (let offset = 0; offset < LOOKAHEAD_DAYS; offset++) {
    const dateISO = toBogotaDateISO(addDays(today, offset));
    const slots = await getAvailableSlotsForDate(dateISO, service.id);
    if (slots.length > 0) {
      return {
        dateLabel: formatDateLabel(dateISO, offset),
        slots: slots.slice(0, MAX_SLOTS_SHOWN).map((s) => ({ iso: s.startsAt, label: formatTimeLabel(s.startsAt) })),
      };
    }
  }

  return null;
}
