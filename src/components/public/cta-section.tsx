import { CtaButtons } from "@/components/public/cta-buttons";
import { PawGlyph } from "@/components/public/paw-glyph";
import { buildWhatsAppLink } from "@/components/public/whatsapp";
import type { ClinicSettings } from "@/lib/types";

export function CtaSection({ settings }: { settings: ClinicSettings }) {
  const whatsappHref = buildWhatsAppLink(settings.whatsapp);

  return (
    <section className="relative overflow-hidden bg-pine py-20 md:py-28">
      <PawGlyph className="pointer-events-none absolute top-1/2 left-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 text-cream/[0.04]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-semibold text-cream sm:text-4xl md:text-5xl">
          Reserva la próxima visita de tu mascota
        </h2>
        <p className="max-w-lg text-lg text-cream/75">
          Agenda en minutos, elige el horario que te sirva y te confirmamos por WhatsApp.
        </p>
        <div className="pt-2">
          <CtaButtons whatsappHref={whatsappHref} />
        </div>
      </div>
    </section>
  );
}
