import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireN8nAuth } from "@/lib/n8n";

/**
 * GET /api/n8n/inactive
 * Dueños sin visitas recientes (o sin visita registrada), con sus mascotas,
 * para que n8n arme el mensaje de reactivación.
 */
export async function GET(req: NextRequest) {
  if (!requireN8nAuth(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from("clinic_settings")
    .select("inactivity_days")
    .eq("id", 1)
    .single();

  if (settingsError || !settings) {
    return NextResponse.json({ error: "No se pudo cargar la configuración." }, { status: 500 });
  }

  const cutoff = subDays(new Date(), settings.inactivity_days).toISOString();

  const { data, error } = await supabase
    .from("owners")
    .select("id, full_name, phone, last_visit_at, pets(name, species)")
    .or(`last_visit_at.lt.${cutoff},last_visit_at.is.null`)
    .order("full_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los clientes inactivos." }, { status: 500 });
  }

  type Row = {
    id: string;
    full_name: string;
    phone: string;
    last_visit_at: string | null;
    pets: { name: string; species: string }[];
  };

  const result = ((data ?? []) as unknown as Row[]).map((o) => ({
    owner_id: o.id,
    owner_name: o.full_name,
    phone: o.phone,
    last_visit_at: o.last_visit_at,
    pets: o.pets ?? [],
  }));

  return NextResponse.json(result);
}
