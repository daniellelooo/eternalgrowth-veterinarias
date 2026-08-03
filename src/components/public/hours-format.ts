import type { BusinessHour } from "@/lib/types";

export interface HoursGroup {
  id: string;
  /** Etiqueta de días, ej. "Lunes a viernes" o "Sábados". */
  days: string;
  /** Etiqueta de horario, ej. "8:00 a.m. – 6:00 p.m." o "Cerrado". */
  hours: string;
  closed: boolean;
}

// weekday: 0 = domingo ... 6 = sábado (como en la tabla business_hours)
const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

const DAY_NAMES_PLURAL: Record<number, string> = {
  0: "Domingos",
  6: "Sábados",
};

function dayLabelPlural(weekday: number): string {
  return DAY_NAMES_PLURAL[weekday] ?? DAY_NAMES[weekday];
}

function dayRangeLabel(weekdays: number[]): string {
  if (weekdays.length === 1) return dayLabelPlural(weekdays[0]);
  const first = weekdays[0];
  const last = weekdays[weekdays.length - 1];
  return `${DAY_NAMES[first]} a ${DAY_NAMES[last].toLowerCase()}`;
}

/** Convierte "08:00" o "08:00:00" a "8:00 a.m." */
export function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr ?? "0", 10);
  const period = h >= 12 ? "p.m." : "a.m.";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m.toString().padStart(2, "0");
  return `${h}:${mm} ${period}`;
}

/**
 * Agrupa los horarios de atención por días consecutivos con el mismo
 * horario (orden de exhibición lunes→domingo), y marca como "Cerrado" los
 * días sin fila en business_hours.
 */
export function groupBusinessHours(hours: BusinessHour[]): HoursGroup[] {
  const byWeekday = new Map<number, BusinessHour>();
  for (const h of hours) {
    if (!byWeekday.has(h.weekday)) byWeekday.set(h.weekday, h);
  }

  const displayOrder = [1, 2, 3, 4, 5, 6, 0]; // lunes..sábado, domingo al final

  type RawGroup = { weekdays: number[]; open: string | null; close: string | null; closed: boolean };
  const raw: RawGroup[] = [];

  for (const weekday of displayOrder) {
    const entry = byWeekday.get(weekday);
    const key = entry ? `${entry.open_time}-${entry.close_time}` : "closed";
    const last = raw[raw.length - 1];
    const lastKey = last ? (last.closed ? "closed" : `${last.open}-${last.close}`) : null;

    if (last && lastKey === key) {
      last.weekdays.push(weekday);
    } else {
      raw.push({
        weekdays: [weekday],
        open: entry?.open_time ?? null,
        close: entry?.close_time ?? null,
        closed: !entry,
      });
    }
  }

  return raw.map((group, index) => ({
    id: `${group.weekdays.join("-")}-${index}`,
    days: dayRangeLabel(group.weekdays),
    hours: group.closed || !group.open || !group.close
      ? "Cerrado"
      : `${formatTime12h(group.open)} – ${formatTime12h(group.close)}`,
    closed: group.closed,
  }));
}
