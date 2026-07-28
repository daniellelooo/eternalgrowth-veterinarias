import "server-only";
import { TZDate } from "@date-fns/tz";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeAvailableSlots } from "@/lib/availability";
import { getClinicSettings } from "@/lib/data/settings";

const TIMEZONE = "America/Bogota";

/** Estados de cita que ocupan un horario (no liberan el slot). */
const BUSY_STATUSES = ["pendiente", "confirmada", "atendida"];

/** Límites [inicio, fin) de un día YYYY-MM-DD en la tz del negocio, en UTC. */
function dayBoundsUtc(dateISO: string): { startUtc: Date; endUtc: Date } {
  const [y, m, d] = dateISO.split("-").map(Number);
  const start = new TZDate(y, m - 1, d, 0, 0, 0, TIMEZONE);
  const end = new TZDate(y, m - 1, d + 1, 0, 0, 0, TIMEZONE);
  return { startUtc: new Date(start), endUtc: new Date(end) };
}

/** Convierte un Date/ISO a la fecha YYYY-MM-DD en la tz del negocio. */
export function toBogotaDateISO(date: Date): string {
  const zoned = new TZDate(date, TIMEZONE);
  const y = zoned.getFullYear();
  const m = String(zoned.getMonth() + 1).padStart(2, "0");
  const d = String(zoned.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Slots disponibles para una fecha y servicio: carga horario del negocio,
 * citas activas del día y bloqueos de agenda que intersecten el día, y
 * delega el cálculo al motor puro `computeAvailableSlots`.
 */
export async function getAvailableSlotsForDate(
  dateISO: string,
  serviceId: string
): Promise<{ startsAt: string }[]> {
  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError || !service) {
    return [];
  }

  const { startUtc, endUtc } = dayBoundsUtc(dateISO);

  const [settings, businessHoursRes, appointmentsRes, blocksRes] = await Promise.all([
    getClinicSettings(),
    supabase.from("business_hours").select("weekday, open_time, close_time"),
    supabase
      .from("appointments")
      .select("starts_at, ends_at")
      .in("status", BUSY_STATUSES)
      .lt("starts_at", endUtc.toISOString())
      .gt("ends_at", startUtc.toISOString()),
    supabase
      .from("schedule_blocks")
      .select("starts_at, ends_at")
      .lt("starts_at", endUtc.toISOString())
      .gt("ends_at", startUtc.toISOString()),
  ]);

  if (businessHoursRes.error || appointmentsRes.error || blocksRes.error) {
    throw new Error("No se pudo calcular la disponibilidad.");
  }

  const busy = [
    ...(appointmentsRes.data ?? []).map((a) => ({
      start: new Date(a.starts_at),
      end: new Date(a.ends_at),
    })),
    ...(blocksRes.data ?? []).map((b) => ({
      start: new Date(b.starts_at),
      end: new Date(b.ends_at),
    })),
  ];

  const slots = computeAvailableSlots({
    date: dateISO,
    durationMinutes: service.duration_minutes,
    businessHours: businessHoursRes.data ?? [],
    busy,
    now: new Date(),
    leadMinutes: settings.booking_lead_minutes,
    stepMinutes: settings.slot_step_minutes,
    timezone: TIMEZONE,
  });

  return slots.map((s) => ({ startsAt: s.toISOString() }));
}
