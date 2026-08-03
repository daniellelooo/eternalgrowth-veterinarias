import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

/**
 * Par de llamados a la acción usado en el hero y en el CTA final, ambos
 * sobre fondo pino oscuro. El primario lleva el ícono anidado en su propia
 * cápsula ("botón dentro del botón"); el de WhatsApp es un contorno claro.
 */
export function CtaButtons({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href="/agendar"
        className="group inline-flex items-center justify-between gap-4 rounded-full bg-amber py-1.5 pr-1.5 pl-6 text-base font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-amber-deep active:scale-[0.98]"
      >
        Agendar cita
        <span className="flex size-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
          <ArrowRight className="size-4" />
        </span>
      </Link>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-cream/30 px-6 py-3 text-base font-medium text-cream transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-cream/60 hover:bg-cream/10 active:scale-[0.98]"
        >
          <MessageCircle className="size-4.5" />
          Escribir por WhatsApp
        </a>
      )}
    </div>
  );
}
