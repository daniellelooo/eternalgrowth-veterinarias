import { TZDate } from "@date-fns/tz";
import { addMinutes } from "date-fns";

export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface AvailabilityInput {
  date: string; // 'YYYY-MM-DD' en tz del negocio
  durationMinutes: number;
  businessHours: { weekday: number; open_time: string; close_time: string }[];
  busy: BusyInterval[];
  now: Date;
  leadMinutes?: number; // default 60
  stepMinutes?: number; // default 30
  timezone?: string; // default 'America/Bogota'
}

const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && bStart < aEnd;

export function computeAvailableSlots(input: AvailabilityInput): Date[] {
  const tz = input.timezone ?? "America/Bogota";
  const step = input.stepMinutes ?? 30;
  const lead = input.leadMinutes ?? 60;
  const [y, m, d] = input.date.split("-").map(Number);

  // Compute weekday at local noon to avoid DST/edge issues near midnight.
  const weekday = new TZDate(y, m - 1, d, 12, 0, tz).getDay();
  const windows = input.businessHours.filter((h) => h.weekday === weekday);
  if (windows.length === 0) return [];

  const minStart = addMinutes(input.now, lead);
  const slots: Date[] = [];

  for (const w of windows) {
    const [oh, om] = w.open_time.split(":").map(Number);
    const [ch, cm] = w.close_time.split(":").map(Number);
    const open = new TZDate(y, m - 1, d, oh, om, tz);
    const close = new TZDate(y, m - 1, d, ch, cm, tz);

    for (
      let s: Date = new Date(open);
      addMinutes(s, input.durationMinutes) <= close;
      s = addMinutes(s, step)
    ) {
      const e = addMinutes(s, input.durationMinutes);
      if (s < minStart) continue;
      if (input.busy.some((b) => overlaps(s, e, b.start, b.end))) continue;
      slots.push(new Date(s));
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}
