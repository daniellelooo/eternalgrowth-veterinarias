import "server-only";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlotsForDate, toBogotaDateISO } from "@/lib/data/availability";
import { DEMO_SERVICES, encodeDemoAppointment, isDemoMode } from "@/lib/data/demo";
import { notifyN8n } from "@/lib/n8n";
import type { Appointment } from "@/lib/types";

const createAppointmentSchema = z.object({
  serviceId: z.string().uuid("Servicio inválido."),
  startsAt: z.string().datetime("Fecha y hora inválidas."),
  customerName: z.string().trim().min(2, "Ingresa tu nombre completo."),
  customerPhone: z
    .string()
    .trim()
    .regex(/^3\d{9}$/, "Ingresa un celular colombiano válido (10 dígitos, inicia en 3)."),
  petName: z.string().trim().min(1).optional(),
  notes: z.string().trim().optional(),
});

export type CreatePublicAppointmentInput = z.infer<typeof createAppointmentSchema>;

/**
 * Crea una cita desde el sitio público. Valida el input, re-verifica que el
 * slot siga libre (releyendo citas y recomputando disponibilidad, para
 * evitar dobles reservas por condiciones de carrera) y notifica a n8n.
 */
export async function createPublicAppointment(
  input: CreatePublicAppointmentInput
): Promise<{ id: string } | { error: string }> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { serviceId, startsAt, customerName, customerPhone, petName, notes } = parsed.data;

  // Modo demo: se valida y se comprueba el horario igual que en real, pero no
  // hay dónde insertar, así que el resumen viaja codificado a la confirmación.
  if (isDemoMode()) {
    const demoService = DEMO_SERVICES.find((s) => s.id === serviceId);
    if (!demoService || !demoService.active) {
      return { error: "El servicio seleccionado ya no está disponible." };
    }

    const demoStart = new Date(startsAt);
    if (Number.isNaN(demoStart.getTime())) {
      return { error: "Fecha y hora inválidas." };
    }

    const demoSlots = await getAvailableSlotsForDate(
      toBogotaDateISO(demoStart),
      serviceId
    );
    if (!demoSlots.some((s) => s.startsAt === demoStart.toISOString())) {
      return { error: "Ese horario ya no está disponible. Por favor elige otro." };
    }

    return {
      id: encodeDemoAppointment({
        serviceId,
        startsAt: demoStart.toISOString(),
        customerName,
        petName: petName ?? null,
      }),
    };
  }

  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, duration_minutes, active")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError || !service || !service.active) {
    return { error: "El servicio seleccionado ya no está disponible." };
  }

  const startDate = new Date(startsAt);
  if (Number.isNaN(startDate.getTime())) {
    return { error: "Fecha y hora inválidas." };
  }

  // Re-verificación: recalcula disponibilidad justo antes de insertar para
  // evitar que dos personas reserven el mismo horario en paralelo.
  const dateISO = toBogotaDateISO(startDate);
  const freshSlots = await getAvailableSlotsForDate(dateISO, serviceId);
  const stillFree = freshSlots.some((s) => s.startsAt === startDate.toISOString());

  if (!stillFree) {
    return { error: "Ese horario ya no está disponible. Por favor elige otro." };
  }

  const endsAt = addMinutes(startDate, service.duration_minutes);

  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      service_id: serviceId,
      starts_at: startDate.toISOString(),
      ends_at: endsAt.toISOString(),
      customer_name: customerName,
      customer_phone: customerPhone,
      pet_name: petName ?? null,
      notes: notes ?? null,
      channel: "web",
      status: "pendiente",
    })
    .select("*")
    .single();

  if (insertError || !appointment) {
    return { error: "No se pudo agendar la cita. Intenta de nuevo." };
  }

  await notifyN8n("appointment.created", appointment as Appointment);

  return { id: appointment.id as string };
}
