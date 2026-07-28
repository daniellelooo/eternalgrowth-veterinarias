import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireN8nAuth, notifyN8n } from "@/lib/n8n";

const bodySchema = z.object({
  status: z.enum(["pendiente", "confirmada", "atendida", "cancelada", "inasistencia"]),
});

/**
 * PATCH /api/n8n/appointments/:id
 * Actualiza el estado de una cita (usado por n8n tras confirmar/cancelar
 * por WhatsApp) y notifica el cambio de vuelta a n8n.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireN8nAuth(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Estado inválido." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la cita." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
  }

  await notifyN8n("appointment.status_changed", data);

  return NextResponse.json(data);
}
