import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addDays, format } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireN8nAuth } from "@/lib/n8n";

const querySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(15),
});

/**
 * GET /api/n8n/reminders?days=15
 * Registros de salud (vacuna/desparasitación) próximos a vencer, con datos
 * de mascota y dueño para que n8n arme el mensaje de recordatorio.
 */
export async function GET(req: NextRequest) {
  if (!requireN8nAuth(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ days: searchParams.get("days") ?? undefined });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Parámetros inválidos." },
      { status: 400 }
    );
  }

  const cutoff = format(addDays(new Date(), parsed.data.days), "yyyy-MM-dd");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("health_records")
    .select(
      "id, type, product, next_due_at, pet:pets(name, species, owner:owners(full_name, phone))"
    )
    .not("next_due_at", "is", null)
    .lte("next_due_at", cutoff)
    .order("next_due_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los recordatorios." }, { status: 500 });
  }

  type Row = {
    id: string;
    type: string;
    product: string | null;
    next_due_at: string;
    pet: { name: string; species: string; owner: { full_name: string; phone: string } | null } | null;
  };

  const result = ((data ?? []) as unknown as Row[]).map((r) => ({
    record_id: r.id,
    type: r.type,
    product: r.product,
    next_due_at: r.next_due_at,
    pet_name: r.pet?.name ?? null,
    species: r.pet?.species ?? null,
    owner_name: r.pet?.owner?.full_name ?? null,
    phone: r.pet?.owner?.phone ?? null,
  }));

  return NextResponse.json(result);
}
