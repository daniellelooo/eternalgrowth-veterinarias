import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireN8nAuth } from "@/lib/n8n";

const statusEnum = z.enum(["pendiente", "confirmada", "atendida", "cancelada", "inasistencia"]);

const querySchema = z.object({
  from: z.string().datetime("Parámetro 'from' inválido."),
  to: z.string().datetime("Parámetro 'to' inválido."),
  status: statusEnum.optional(),
});

/**
 * GET /api/n8n/appointments?from=ISO&to=ISO&status=confirmada
 * Citas en un rango (p.ej. para recordatorio 24h), con nombre de servicio.
 */
export async function GET(req: NextRequest) {
  if (!requireN8nAuth(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Parámetros inválidos." },
      { status: 400 }
    );
  }

  const { from, to, status } = parsed.data;

  const supabase = createAdminClient();
  let query = supabase
    .from("appointments")
    .select("id, customer_name, customer_phone, pet_name, starts_at, status, service:services(name)")
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar las citas." }, { status: 500 });
  }

  type Row = {
    id: string;
    customer_name: string;
    customer_phone: string;
    pet_name: string | null;
    starts_at: string;
    status: string;
    service: { name: string } | null;
  };

  const result = ((data ?? []) as unknown as Row[]).map((a) => ({
    id: a.id,
    customer_name: a.customer_name,
    customer_phone: a.customer_phone,
    pet_name: a.pet_name,
    service_name: a.service?.name ?? null,
    starts_at: a.starts_at,
    status: a.status,
  }));

  return NextResponse.json(result);
}
