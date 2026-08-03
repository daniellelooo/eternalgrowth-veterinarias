import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandMark } from "@/components/public/brand-mark";
import { buildWhatsAppLink } from "@/components/public/whatsapp";
import type { ClinicSettings } from "@/lib/types";

export function SiteFooter({ settings }: { settings: ClinicSettings }) {
  const whatsappHref = buildWhatsAppLink(settings.whatsapp);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pine-deep text-cream/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <BrandMark variant="dark" />
              <span className="font-heading text-lg font-semibold text-cream">{settings.name}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Consulta general, vacunación, desparasitación y más, con seguimiento cercano a cada mascota.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium tracking-[0.14em] text-cream/50 uppercase">Contacto</h3>
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-cream"
              >
                <Phone className="size-4" />
                {settings.phone}
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-cream"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-cream"
              >
                <Mail className="size-4" />
                {settings.email}
              </a>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium tracking-[0.14em] text-cream/50 uppercase">Ubicación</h3>
            {settings.address && (
              <span className="inline-flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {settings.address}
              </span>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-6 text-xs text-cream/50">
          © {year} {settings.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
