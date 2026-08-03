import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, MessageCircle, Phone } from "lucide-react";
import { CtaButtons } from "@/components/public/cta-buttons";
import { PawGlyph } from "@/components/public/paw-glyph";
import { buildWhatsAppLink } from "@/components/public/whatsapp";
import { getNextAvailability } from "@/components/public/next-availability";
import type { ClinicSettings, Service } from "@/lib/types";

export async function Hero({ settings, services }: { settings: ClinicSettings; services: Service[] }) {
  const whatsappHref = buildWhatsAppLink(settings.whatsapp);
  const nextAvailability = await getNextAvailability(services[0]);

  return (
    <section className="relative overflow-hidden bg-pine">
      {/* Viñeta sutil + textura de huellas, monocromas — no un gradiente de color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.05),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(0,0,0,0.35),transparent_55%)]"
      />
      <PawGlyph className="pointer-events-none absolute -right-16 -top-16 size-72 rotate-12 text-cream/5" />
      <PawGlyph className="pointer-events-none absolute -bottom-20 left-[8%] size-56 -rotate-[20deg] text-cream/5" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full border border-cream/25 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-cream/75 uppercase">
            Clínica veterinaria en Medellín
          </span>

          <h1 className="font-heading text-4xl leading-[1.08] font-semibold text-cream sm:text-5xl lg:text-6xl">
            El cuidado que tu mascota merece, sin vueltas.
          </h1>

          {settings.description && (
            <p className="max-w-lg text-lg leading-relaxed text-cream/80">{settings.description}</p>
          )}

          <div className="pt-2">
            <CtaButtons whatsappHref={whatsappHref} />
          </div>

          {settings.phone && (
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-cream"
            >
              <Phone className="size-4" />o llama al {settings.phone}
            </a>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-4 lg:mx-0">
          {/* Vista previa de disponibilidad real (double-bezel: marco + núcleo) —
              contenido genuino, no un panel decorativo a la espera de una foto. */}
          <div className="rounded-[2rem] bg-cream/10 p-2 ring-1 ring-cream/15">
            <div className="rounded-[1.6rem] bg-cream p-6 text-ink sm:p-7">
              {nextAvailability ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-clay uppercase">
                      <CalendarCheck className="size-3.5" />
                      Cupos disponibles
                    </span>
                    <PawGlyph className="size-5 text-pine/15" />
                  </div>

                  <p className="mt-3 font-heading text-xl text-pine">{nextAvailability.dateLabel}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {nextAvailability.slots.map((slot) => (
                      <Link
                        key={slot.iso}
                        href="/agendar"
                        className="rounded-xl border border-pine/15 bg-sand/70 px-3 py-2.5 text-center text-sm font-semibold text-pine transition-colors duration-200 hover:bg-pine hover:text-cream"
                      >
                        {slot.label}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/agendar"
                    className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-pine hover:underline"
                  >
                    Ver todos los horarios
                    <ArrowRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" />
                  </Link>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-clay uppercase">
                    <MessageCircle className="size-3.5" />
                    Agenda solicitada
                  </span>
                  <p className="mt-3 font-heading text-xl text-pine">Escríbenos y te confirmamos el primer cupo</p>
                  <p className="mt-2 text-sm text-ink/70">
                    Por ahora no hay horarios libres en los próximos días. Cuéntanos qué necesita tu mascota y te
                    avisamos apenas se abra un espacio.
                  </p>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pine/90"
                    >
                      <MessageCircle className="size-4" />
                      Escribir por WhatsApp
                    </a>
                  ) : (
                    <Link
                      href="/agendar"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-pine hover:underline"
                    >
                      Ir al formulario de agendamiento
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tarjeta de dirección — en flujo normal, nunca superpuesta sobre la
              tarjeta de disponibilidad (evita cualquier colisión con el link
              "Ver todos los horarios" en cualquier ancho de pantalla). */}
          {settings.address && (
            <a
              href="#ubicacion"
              className="flex w-fit max-w-full items-start gap-3 rounded-2xl bg-cream/10 p-4 text-left ring-1 ring-cream/15 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-cream/15"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream">
                <MapPin className="size-4.5" />
              </span>
              <span>
                <span className="block text-xs font-medium tracking-wide text-cream/55 uppercase">Visítanos</span>
                <span className="block text-sm leading-snug font-medium text-cream/90">{settings.address}</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
