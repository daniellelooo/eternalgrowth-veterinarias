import { Clock } from "lucide-react";
import { getServiceIcon } from "@/components/public/service-icon";
import type { Service } from "@/lib/types";

const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function formatPrice(price: number | null): string {
  if (price === null) return "Consultar valor";
  return priceFormatter.format(price);
}

function ServiceTicket({ service }: { service: Service }) {
  const Icon = getServiceIcon(service.name);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-cream ring-1 ring-ink/10 shadow-[0_1px_2px_rgba(34,29,23,0.05),0_16px_32px_-20px_rgba(34,29,23,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
      <div className="flex items-start gap-4 p-6">
        <div className="rounded-2xl bg-pine/8 p-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-pine text-cream">
            <Icon className="size-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg text-pine">{service.name}</h3>
          {service.description && (
            <p className="mt-1 text-sm leading-relaxed text-ink/70">{service.description}</p>
          )}
        </div>
      </div>

      {/* Perforación estilo boleto: el borde punteado + las "muescas" recortadas por el overflow-hidden del contenedor */}
      <div className="relative px-6">
        <span aria-hidden="true" className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-sand" />
        <span aria-hidden="true" className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-sand" />
        <div className="border-t border-dashed border-ink/20" />
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-tint px-2.5 py-1 text-xs font-medium text-pine">
          <Clock className="size-3.5" />
          {service.duration_minutes} min
        </span>
        <span className="font-heading text-xl font-semibold text-ink">{formatPrice(service.price_cop)}</span>
      </div>
    </div>
  );
}

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="servicios" className="scroll-mt-24 bg-sand pt-20 pb-12 md:pt-28 md:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-[0.18em] text-clay uppercase">Servicios</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-pine sm:text-4xl">
            Todo lo que tu mascota necesita, en un solo lugar
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Cada servicio es una cita reservable: elige el que necesitas y agenda la hora que mejor te quede.
          </p>
        </div>

        {services.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
            {services.map((service) => (
              <ServiceTicket key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-ink/60">Pronto publicaremos nuestros servicios aquí.</p>
        )}
      </div>
    </section>
  );
}
