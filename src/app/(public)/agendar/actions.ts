"use server";

import { redirect } from "next/navigation";
import { createPublicAppointment, type CreatePublicAppointmentInput } from "@/lib/data/appointments";

/**
 * Envuelve `createPublicAppointment`: valida y re-verifica disponibilidad
 * (todo eso ya lo hace la función de datos), y si la cita se creó, redirige
 * a la confirmación. Si falla, devuelve el mensaje de error en español para
 * que el wizard lo muestre sin perder los datos ya ingresados.
 */
export async function bookAppointment(
  input: CreatePublicAppointmentInput
): Promise<{ error: string } | undefined> {
  const result = await createPublicAppointment(input);

  if ("error" in result) {
    return { error: result.error };
  }

  redirect(`/agendar/confirmacion?id=${result.id}`);
}
