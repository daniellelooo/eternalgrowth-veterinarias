import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, MessageCircle, PawPrint, User } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClinicSettings } from "@/lib/data/settings";
import { DEMO_SERVICES, decodeDemoAppointment, isDemoMode } from "@/lib/data/demo";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { PawGlyph } from "@/components/public/paw-glyph";
import { buildWhatsAppLink } from "@/components/public/whatsapp";
import { formatFullDateLabel, formatSlotTime, isoDateInBogota } from "@/components/booking/date-utils";
import type { Appointment } from "@/lib/types";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface AppointmentSummary {
  appointment: Appointment;
  serviceName: string | null;
  durationMinutes: number | null;
  priceCop: number | null;
}

/**
 * Trae la cita real desde la base de datos por id. No confiamos en nada más
 * que venga por query string: el resumen que se muestra sale siempre de lo
 * que quedó guardado, no de lo que el navegador diga que se envió.
 */
async function getAppointmentSummary(id: string): Promise<AppointmentSummary | null> {
  // Modo demo: no hay cita guardada, el resumen viene codificado en el enlace.
  if (isDemoMode()) {
    const demo = decodeDemoAppointment(id);
    if (!demo) return null;

    const service = DEMO_SERVICES.find((s) => s.id === demo.serviceId) ?? null;

    return {
      appointment: {
        id,
        owner_id: null,
        pet_id: null,
        customer_name: demo.customerName,
        customer_phone: "",
        pet_name: demo.petName,
        service_id: demo.serviceId,
        starts_at: demo.startsAt,
        ends_at: demo.startsAt,
        status: "pendiente",
        channel: "web",
        notes: null,
        created_at: demo.startsAt,
      },
      serviceName: service?.name ?? null,
      durationMinutes: service?.duration_minutes ?? null,
      priceCop: service?.price_cop ?? null,
    };
  }

  if (!UUID_RE.test(id)) return null;

  const supabase = createAdminClient();
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !appointment) return null;

  let serviceName: string | null = null;
  let durationMinutes: number | null = null;
  let priceCop: number | null = null;

  if (appointment.service_id) {
    const { data: service } = await supabase
      .from("services")
      .select("name, duration_minutes, price_cop")
      .eq("id", appointment.service_id)
      .maybeSingle();
    if (service) {
      serviceName = service.name;
      durationMinutes = service.duration_minutes;
      priceCop = service.price_cop;
    }
  }

  return { appointment: appointment as Appointment, serviceName, durationMinutes, priceCop };
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const settings = await getClinicSettings();
  const summary = id ? await getAppointmentSummary(id) : null;
  const whatsappHref = buildWhatsAppLink(settings.whatsapp);

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1 bg-sand">
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            {summary ? (
              <SuccessCard summary={summary} whatsappHref={whatsappHref} />
            ) : (
              <NotFoundCard whatsappHref={whatsappHref} />
            )}
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

function SuccessCard({ summary, whatsappHref }: { summary: AppointmentSummary; whatsappHref: string | null }) {
  const { appointment, serviceName, durationMinutes, priceCop } = summary;
  const dateLabel = formatFullDateLabel(isoDateInBogota(appointment.starts_at));
  const timeLabel = formatSlotTime(appointment.starts_at);

  return (
    <div className="rounded-[2rem] bg-ink/5 p-2 ring-1 ring-ink/10">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-cream p-6 text-center shadow-[0_1px_2px_rgba(34,29,23,0.05),0_16px_32px_-20px_rgba(34,29,23,0.35)] sm:p-8">
        <PawGlyph className="pointer-events-none absolute -top-6 -right-8 size-32 rotate-12 text-pine/[0.04]" />

        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-pine text-cream">
          <CalendarCheck className="size-6" />
        </span>

        <h1 className="mt-5 font-heading text-2xl font-semibold text-pine sm:text-3xl">¡Cita agendada!</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Te escribiremos por WhatsApp para confirmar los detalles. Guarda este resumen mientras tanto.
        </p>

        {/* Boleto de la cita: mismo motivo de perforación que las tarjetas de servicio */}
        <div className="relative mt-6 overflow-hidden rounded-2xl bg-sand text-left ring-1 ring-ink/10">
          <div className="flex flex-col gap-3 p-5">
            {serviceName && (
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine/8 text-pine">
                  <PawPrint className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-ink/50 uppercase">Servicio</p>
                  <p className="truncate font-heading text-base text-pine">{serviceName}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine/8 text-pine">
                <Clock className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-ink/50 uppercase">Fecha y hora</p>
                <p className="font-heading text-base text-pine">
                  {dateLabel} · {timeLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine/8 text-pine">
                <User className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-ink/50 uppercase">A nombre de</p>
                <p className="truncate font-heading text-base text-pine">
                  {appointment.customer_name}
                  {appointment.pet_name ? ` · ${appointment.pet_name}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="relative px-5">
            <span aria-hidden="true" className="absolute top-0 -left-3 size-6 -translate-y-1/2 rounded-full bg-cream" />
            <span aria-hidden="true" className="absolute top-0 -right-3 size-6 -translate-y-1/2 rounded-full bg-cream" />
            <div className="border-t border-dashed border-ink/20" />
          </div>

          <div className="flex items-center justify-between px-5 py-4 text-sm">
            <span className="text-ink/60">Duración estimada</span>
            <span className="font-medium text-ink">{durationMinutes ? `${durationMinutes} min` : "—"}</span>
          </div>
          {priceCop !== null && (
            <div className="flex items-center justify-between border-t border-ink/10 px-5 py-4 text-sm">
              <span className="text-ink/60">Valor</span>
              <span className="font-semibold text-ink">{priceFormatter.format(priceCop)}</span>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-pine/25 px-6 py-3 text-base font-medium whitespace-nowrap text-pine transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-pine hover:text-cream active:scale-[0.98]"
            >
              <MessageCircle className="size-4.5" />
              Escribir por WhatsApp
            </a>
          )}
          <Link
            href="/"
            className="group inline-flex items-center justify-between gap-4 rounded-full bg-amber py-1.5 pr-1.5 pl-6 text-base font-semibold whitespace-nowrap text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-amber-deep active:scale-[0.98]"
          >
            Volver al inicio
            <span className="flex size-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotFoundCard({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    <div className="rounded-[2rem] bg-ink/5 p-2 ring-1 ring-ink/10">
      <div className="flex flex-col items-center gap-4 rounded-[1.6rem] bg-cream p-8 text-center shadow-[0_1px_2px_rgba(34,29,23,0.05),0_16px_32px_-20px_rgba(34,29,23,0.35)]">
        <PawGlyph className="size-10 text-ink/20" />
        <h1 className="font-heading text-2xl text-pine">No encontramos esa cita</h1>
        <p className="max-w-sm text-sm leading-relaxed text-ink/70">
          El enlace no es válido o la cita ya no existe. Si crees que es un error, agenda de nuevo o escríbenos
          directamente.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/agendar"
            className="group inline-flex items-center justify-between gap-4 rounded-full bg-amber py-1.5 pr-1.5 pl-6 text-base font-semibold whitespace-nowrap text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-amber-deep active:scale-[0.98]"
          >
            Agendar de nuevo
            <span className="flex size-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRight className="size-4" />
            </span>
          </Link>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-pine/25 px-6 py-3 text-base font-medium whitespace-nowrap text-pine transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-pine hover:text-cream active:scale-[0.98]"
            >
              <MessageCircle className="size-4.5" />
              Escribir por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
