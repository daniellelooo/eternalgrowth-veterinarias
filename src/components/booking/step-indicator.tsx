import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Servicio" },
  { id: 2, label: "Fecha y hora" },
  { id: 3, label: "Datos" },
] as const;

/**
 * Indicador de los 3 pasos del agendamiento. La numeración aquí sí encierra
 * información real (es un flujo secuencial: no puedes elegir hora sin
 * servicio, ni enviar datos sin hora), a diferencia de un "01/02/03"
 * puramente decorativo.
 */
export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Progreso del agendamiento" className="mb-8 flex items-center justify-center">
      {STEPS.map((s, i) => {
        const state = s.id === step ? "current" : s.id < step ? "done" : "upcoming";
        return (
          <li key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                  state === "done" && "bg-pine text-cream",
                  state === "current" && "bg-amber text-ink",
                  state === "upcoming" && "bg-ink/8 text-ink/40"
                )}
              >
                {state === "done" ? <Check className="size-3.5" /> : s.id}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  state === "upcoming" ? "text-ink/40" : "text-ink"
                )}
                aria-current={state === "current" ? "step" : undefined}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="mx-2 h-px w-6 shrink-0 bg-ink/15 sm:mx-4 sm:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
