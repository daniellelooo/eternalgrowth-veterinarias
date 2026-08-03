"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { PawGlyph } from "@/components/public/paw-glyph";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types";
import { formatFullDateLabel, formatSlotTime, type DayOption } from "./date-utils";

interface DateTimeStepProps {
  service: Service;
  days: DayOption[];
  dateIso: string | null;
  slotIso: string | null;
  whatsappHref: string | null;
  onSelectDate: (iso: string) => void;
  onSelectSlot: (iso: string) => void;
  onBack: () => void;
  onNext: () => void;
}

/** Paso 2: elegir día (próximos 14, domingos deshabilitados) y horario disponible. */
export function DateTimeStep({
  service,
  days,
  dateIso,
  slotIso,
  whatsappHref,
  onSelectDate,
  onSelectSlot,
  onBack,
  onNext,
}: DateTimeStepProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dateIso) return;
    const controller = new AbortController();

    // Función interna: mantiene las llamadas a setState fuera del cuerpo
    // síncrono directo del efecto (solo se ejecutan al resolver la promesa).
    async function loadSlots() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/availability?date=${dateIso}&serviceId=${service.id}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "No se pudo cargar la disponibilidad.");
        setSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la disponibilidad.");
        setSlots([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSlots();

    return () => controller.abort();
  }, [dateIso, service.id]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-xl text-pine sm:text-2xl">¿Cuándo te queda mejor?</h2>
        <p className="mt-1 text-sm text-ink/60">
          {service.name} · {service.duration_minutes} min
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-[0.14em] text-clay uppercase">Elige un día</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((day) => {
            const selected = day.iso === dateIso;
            return (
              <button
                key={day.iso}
                type="button"
                disabled={day.disabled}
                aria-pressed={selected}
                onClick={() => onSelectDate(day.iso)}
                className={cn(
                  "flex min-w-[3.75rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-2 py-2.5 text-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  selected
                    ? "border-pine bg-pine text-cream"
                    : "border-ink/10 bg-cream text-ink hover:border-pine/30",
                  day.disabled &&
                    "cursor-not-allowed border-ink/5 bg-ink/[0.03] text-ink/25 hover:border-ink/5"
                )}
              >
                <span className="text-[10px] font-medium tracking-wide uppercase opacity-70">
                  {day.weekdayShort}
                </span>
                <span className="font-heading text-base font-semibold">{day.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite">
        <p className="mb-2 text-xs font-medium tracking-[0.14em] text-clay uppercase">
          {dateIso ? formatFullDateLabel(dateIso) : "Horarios"}
        </p>

        {!dateIso && (
          <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/50">
            Elige un día para ver los horarios disponibles.
          </p>
        )}

        {dateIso && loading && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-ink/10 px-4 py-8 text-sm text-ink/60">
            <Loader2 className="size-4 animate-spin" />
            Buscando horarios disponibles…
          </div>
        )}

        {dateIso && !loading && error && (
          <p role="alert" className="rounded-2xl border border-clay/30 bg-clay/10 px-4 py-6 text-center text-sm text-clay">
            {error}
          </p>
        )}

        {dateIso && !loading && !error && slots.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-4 py-8 text-center">
            <PawGlyph className="size-6 text-ink/20" />
            <p className="text-sm text-ink/60">No hay horarios disponibles este día.</p>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine hover:underline"
              >
                <MessageCircle className="size-3.5" /> Escríbenos por WhatsApp
              </a>
            )}
          </div>
        )}

        {dateIso && !loading && !error && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((iso) => {
              const selected = iso === slotIso;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelectSlot(iso)}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-center text-sm font-semibold transition-colors duration-200",
                    selected
                      ? "border-pine bg-pine text-cream"
                      : "border-pine/15 bg-sand/70 text-pine hover:bg-pine hover:text-cream"
                  )}
                >
                  {formatSlotTime(iso)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-3.5" /> Atrás
        </button>
        <button
          type="button"
          disabled={!slotIso}
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
