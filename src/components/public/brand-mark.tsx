import { PawGlyph } from "@/components/public/paw-glyph";
import { cn } from "@/lib/utils";

/**
 * Isotipo simple (círculo + huella) reutilizado en header y footer.
 * `variant="light"` para fondos claros (mancha pino sobre crema),
 * `variant="dark"` para fondos oscuros (mancha crema sobre pino).
 */
export function BrandMark({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
        variant === "light" ? "bg-pine text-cream" : "bg-cream/15 text-cream ring-1 ring-cream/25",
        className
      )}
    >
      <PawGlyph className="size-4.5" />
    </span>
  );
}
