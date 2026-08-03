import { addDays } from "date-fns";

/**
 * Utilidades de fecha/hora puras (sin "server-only"): se usan tanto desde
 * páginas de servidor (para construir los próximos 14 días) como desde el
 * wizard cliente (para formatear horarios). Duplican deliberadamente lo
 * mínimo de la lógica de `src/lib/data/availability.ts` y
 * `src/components/public/next-availability.ts` para no importar módulos
 * "server-only" en un componente cliente.
 */

export const BOGOTA_TZ = "America/Bogota";

export interface DayOption {
  /** Fecha en formato YYYY-MM-DD, en la zona horaria del negocio. */
  iso: string;
  /** 0 = domingo ... 6 = sábado. */
  weekday: number;
  weekdayShort: string;
  dayNumber: string;
  disabled: boolean;
  isToday: boolean;
}

const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function todayIsoBogota(): string {
  return isoFromDate(new Date());
}

function isoFromDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

/** Convierte "YYYY-MM-DD" a un Date neutro (mediodía UTC) para operar sin desplazamientos de tz. */
function isoNeutralDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function addDaysToIso(iso: string, days: number): string {
  const shifted = addDays(isoNeutralDate(iso), days);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function weekdayOfIso(iso: string): number {
  return isoNeutralDate(iso).getUTCDay();
}

/**
 * Convierte un timestamp ISO (con hora) a la fecha "YYYY-MM-DD" que le
 * corresponde en la zona horaria del negocio. Útil para agrupar una cita ya
 * agendada bajo el mismo formato que usan los días del selector.
 */
export function isoDateInBogota(dateTimeIso: string): string {
  return isoFromDate(new Date(dateTimeIso));
}

/**
 * Próximos `count` días (14 por defecto) en tz Bogotá, marcando como
 * deshabilitados los que no tienen horario de atención (ej. domingos).
 */
export function buildBookingDays(openWeekdays: Set<number>, count = 14): DayOption[] {
  const today = todayIsoBogota();
  return Array.from({ length: count }, (_, i) => {
    const iso = i === 0 ? today : addDaysToIso(today, i);
    const weekday = weekdayOfIso(iso);
    const dayNumber = Number(iso.split("-")[2]);
    return {
      iso,
      weekday,
      weekdayShort: WEEKDAY_SHORT[weekday],
      dayNumber: String(dayNumber),
      disabled: !openWeekdays.has(weekday),
      isToday: i === 0,
    };
  });
}

/** Formatea un ISO datetime como "9:30 a.m." en tz Bogotá. */
export function formatSlotTime(iso: string): string {
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

/** Formatea "YYYY-MM-DD" como "Hoy", "Mañana" o "Lunes 28 de julio". */
export function formatFullDateLabel(iso: string): string {
  const today = todayIsoBogota();
  if (iso === today) return "Hoy";
  if (iso === addDaysToIso(today, 1)) return "Mañana";

  const neutral = isoNeutralDate(iso);
  const weekday = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: "UTC" }).format(neutral);
  const day = Number(iso.split("-")[2]);
  const month = new Intl.DateTimeFormat("es-CO", { month: "long", timeZone: "UTC" }).format(neutral);
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} ${day} de ${month}`;
}
