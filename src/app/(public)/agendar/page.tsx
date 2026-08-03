import { getActiveServices, getBusinessHours, getClinicSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { PawGlyph } from "@/components/public/paw-glyph";
import { PawTrail } from "@/components/public/paw-trail";
import { buildWhatsAppLink } from "@/components/public/whatsapp";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { buildBookingDays } from "@/components/booking/date-utils";

// Disponibilidad y horarios cambian a cada rato: nunca servir esto estático.
export const dynamic = "force-dynamic";

export default async function AgendarPage() {
  const [settings, services, businessHours] = await Promise.all([
    getClinicSettings(),
    getActiveServices(),
    getBusinessHours(),
  ]);

  const openWeekdays = new Set(businessHours.map((h) => h.weekday));
  const days = buildBookingDays(openWeekdays);
  const whatsappHref = buildWhatsAppLink(settings.whatsapp);

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1 bg-sand">
        <section className="relative overflow-hidden bg-pine py-14 sm:py-16">
          <PawGlyph className="pointer-events-none absolute -top-10 -right-10 size-48 rotate-12 text-cream/5" />
          <PawGlyph className="pointer-events-none absolute -bottom-14 left-[6%] size-40 -rotate-[16deg] text-cream/5" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center rounded-full border border-cream/25 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-cream/75 uppercase">
              Agendar cita
            </span>
            <h1 className="mt-4 font-heading text-3xl font-semibold text-cream sm:text-4xl">
              Reserva la próxima visita de tu mascota
            </h1>
            <p className="mt-3 text-base text-cream/75">
              Elige el servicio, la fecha y déjanos tus datos. Te confirmamos por WhatsApp.
            </p>
          </div>
        </section>

        <PawTrail tone="pine" />

        <section className="pt-6 pb-16 sm:pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {services.length > 0 ? (
              <BookingWizard services={services} days={days} whatsappHref={whatsappHref} />
            ) : (
              <p className="rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center text-ink/60">
                Por ahora no hay servicios disponibles para agendar. Escríbenos directamente y te ayudamos.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
