import { Clock, MapPin, MoveUpRight } from "lucide-react";
import { groupBusinessHours } from "@/components/public/hours-format";
import type { BusinessHour, ClinicSettings } from "@/lib/types";

/**
 * Link a Google Maps: usa el pin exacto guardado en settings si existe;
 * si no, construye una búsqueda por dirección. Siempre útil, nunca roto.
 */
function resolveMapsHref(settings: ClinicSettings): string | null {
  if (settings.google_maps_url) return settings.google_maps_url;
  if (settings.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;
  }
  return null;
}

export function HoursLocationSection({
  settings,
  businessHours,
}: {
  settings: ClinicSettings;
  businessHours: BusinessHour[];
}) {
  const groups = groupBusinessHours(businessHours);
  const mapsHref = resolveMapsHref(settings);

  return (
    <section id="horarios" className="scroll-mt-24 bg-sand pt-12 pb-20 md:pt-16 md:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-[0.18em] text-clay uppercase">Horarios y ubicación</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-pine sm:text-4xl">
            Te esperamos cuando lo necesites
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 rounded-[2rem] bg-cream p-2 ring-1 ring-ink/10 md:grid-cols-2 md:gap-2">
          <div className="flex flex-col rounded-[1.6rem] p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2.5 text-pine">
              <span className="flex size-9 items-center justify-center rounded-full bg-sage-tint">
                <Clock className="size-4.5" />
              </span>
              <h3 className="font-heading text-lg">Horarios de atención</h3>
            </div>
            <dl className="divide-y divide-ink/10">
              {groups.map((group) => (
                <div key={group.id} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-sm font-medium text-ink">{group.days}</dt>
                  <dd className={group.closed ? "text-sm text-clay" : "text-sm text-ink/70"}>{group.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="ubicacion" className="scroll-mt-24 flex flex-col rounded-[1.6rem] bg-sage-tint/40 p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2.5 text-pine">
              <span className="flex size-9 items-center justify-center rounded-full bg-cream">
                <MapPin className="size-4.5" />
              </span>
              <h3 className="font-heading text-lg">Ubicación</h3>
            </div>

            <dl className="divide-y divide-ink/15">
              {settings.address && (
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="shrink-0 text-sm font-medium text-ink">Dirección</dt>
                  <dd className="text-right text-sm leading-relaxed text-ink/80">{settings.address}</dd>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm font-medium text-ink">Teléfono</dt>
                  <dd className="text-right text-sm text-ink/80">
                    <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-pine hover:underline">
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="shrink-0 text-sm font-medium text-ink">Correo</dt>
                  <dd className="text-right text-sm break-all text-ink/80">
                    <a href={`mailto:${settings.email}`} className="hover:text-pine hover:underline">
                      {settings.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-pine/25 px-5 py-2.5 text-sm font-medium text-pine transition-colors hover:bg-pine hover:text-cream"
              >
                Cómo llegar
                <MoveUpRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
