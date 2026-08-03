import { PawGlyph } from "@/components/public/paw-glyph";
import { cn } from "@/lib/utils";

/**
 * Divisor decorativo entre secciones: un pequeño rastro de huellas que guía
 * la mirada hacia abajo, hacia la reserva de cita. Puramente ornamental.
 */
export function PawTrail({ className, tone = "pine" }: { className?: string; tone?: "pine" | "cream" }) {
  const color = tone === "cream" ? "text-cream/40" : "text-pine/25";
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-end justify-center gap-6 py-2", className)}
    >
      <PawGlyph className={cn("size-3 rotate-[-12deg] translate-y-1", color)} />
      <PawGlyph className={cn("size-4 rotate-[6deg]", color)} />
      <PawGlyph className={cn("size-3 rotate-[-8deg] translate-y-1.5", color)} />
    </div>
  );
}
