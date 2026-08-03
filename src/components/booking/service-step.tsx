"use client";

import { ArrowRight, Check, Clock } from "lucide-react";
import { getServiceIcon } from "@/components/public/service-icon";
import { cn } from "@/lib/utils";
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

interface ServiceStepProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}

/** Paso 1: elegir servicio. Reutiliza el motivo de "boleto" del sitio público, hecho seleccionable. */
export function ServiceStep({ services, selectedId, onSelect, onNext }: ServiceStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl text-pine sm:text-2xl">¿Qué necesita tu mascota?</h2>
        <p className="mt-1 text-sm text-ink/60">Elige el servicio para ver los horarios disponibles.</p>
      </div>

      <div role="radiogroup" aria-label="Servicios disponibles" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = getServiceIcon(service.name);
          const selected = service.id === selectedId;
          return (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(service.id)}
              className={cn(
                "group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                selected
                  ? "border-pine bg-pine/5 ring-2 ring-pine"
                  : "border-ink/10 bg-cream hover:border-pine/30 hover:bg-pine/[0.03]"
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                  selected ? "bg-pine text-cream" : "bg-pine/8 text-pine"
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base text-pine">{service.name}</p>
                {service.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink/60">{service.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-tint px-2 py-0.5 font-medium text-pine">
                    <Clock className="size-3" />
                    {service.duration_minutes} min
                  </span>
                  <span className="font-semibold text-ink">{formatPrice(service.price_cop)}</span>
                </div>
              </div>
              {selected && (
                <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-pine text-cream">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!selectedId}
          onClick={onNext}
          className="group inline-flex items-center justify-between gap-4 rounded-full bg-amber py-1.5 pr-1.5 pl-6 text-base font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-amber-deep active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          Continuar
          <span className="flex size-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
            <ArrowRight className="size-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
