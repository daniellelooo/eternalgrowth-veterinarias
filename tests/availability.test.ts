import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "@/lib/availability";

const HOURS = [{ weekday: 2, open_time: "08:00", close_time: "12:00" }]; // martes
const PAST = new Date("2026-07-20T00:00:00-05:00"); // 'now' muy anterior
const TUESDAY = "2026-07-28"; // martes

const iso = (d: Date) => d.toISOString();

describe("computeAvailableSlots", () => {
  it("genera slots cada 30 min dentro del horario", () => {
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 30, businessHours: HOURS, busy: [], now: PAST });
    expect(slots).toHaveLength(8); // 8:00..11:30
    expect(iso(slots[0])).toBe("2026-07-28T13:00:00.000Z"); // 08:00 -05
    expect(iso(slots[7])).toBe("2026-07-28T16:30:00.000Z"); // 11:30 -05
  });

  it("el servicio debe caber antes del cierre", () => {
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 60, businessHours: HOURS, busy: [], now: PAST });
    expect(iso(slots.at(-1)!)).toBe("2026-07-28T16:00:00.000Z"); // último 11:00
  });

  it("excluye slots que chocan con citas existentes", () => {
    const busy = [{ start: new Date("2026-07-28T14:00:00.000Z"), end: new Date("2026-07-28T14:30:00.000Z") }]; // 9:00-9:30
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 30, businessHours: HOURS, busy, now: PAST });
    expect(slots.map(iso)).not.toContain("2026-07-28T14:00:00.000Z");
    expect(slots).toHaveLength(7);
  });

  it("un servicio largo no cabe sobre una cita intermedia", () => {
    const busy = [{ start: new Date("2026-07-28T14:00:00.000Z"), end: new Date("2026-07-28T14:30:00.000Z") }];
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 60, businessHours: HOURS, busy, now: PAST });
    // 8:30 (8:30-9:30) sí solapa la cita → excluido
    expect(slots.map(iso)).not.toContain("2026-07-28T13:30:00.000Z");
    // 9:00 (9:00-10:00) solapa → excluido
    expect(slots.map(iso)).not.toContain("2026-07-28T14:00:00.000Z");
    // 8:00 (8:00-9:00) termina justo cuando arranca la cita: consecutivo, no solapa → disponible
    expect(slots.map(iso)).toContain("2026-07-28T13:00:00.000Z");
    // 9:30 arranca justo al terminar la cita → disponible
    expect(slots.map(iso)).toContain("2026-07-28T14:30:00.000Z");
  });

  it("día sin horario configurado devuelve []", () => {
    const slots = computeAvailableSlots({ date: "2026-07-26", durationMinutes: 30, businessHours: HOURS, busy: [], now: PAST }); // domingo
    expect(slots).toEqual([]);
  });

  it("excluye slots pasados y respeta leadMinutes", () => {
    const now = new Date("2026-07-28T14:10:00.000Z"); // 9:10 local
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 30, businessHours: HOURS, busy: [], now, leadMinutes: 60 });
    // mínimo arranque: 10:10 → primer slot 10:30
    expect(iso(slots[0])).toBe("2026-07-28T15:30:00.000Z");
  });
});
