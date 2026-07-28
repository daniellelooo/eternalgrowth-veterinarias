import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlotsForDate } from "@/lib/data/availability";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  serviceId: z.string().uuid("Servicio inválido."),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    date: searchParams.get("date"),
    serviceId: searchParams.get("serviceId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Parámetros inválidos." },
      { status: 400 }
    );
  }

  const { date, serviceId } = parsed.data;
  const slots = await getAvailableSlotsForDate(date, serviceId);

  return NextResponse.json({ slots: slots.map((s) => s.startsAt) });
}
