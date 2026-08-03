import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/public/brand-mark";
import { MobileNav } from "@/components/public/mobile-nav";
import { buildWhatsAppLink } from "@/components/public/whatsapp";
import type { ClinicSettings } from "@/lib/types";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#horarios", label: "Horarios" },
  { href: "#ubicacion", label: "Ubicación" },
];

export function SiteHeader({ settings }: { settings: ClinicSettings }) {
  const whatsappHref = buildWhatsAppLink(settings.whatsapp);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-sand/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <BrandMark variant="light" />
          <span className="truncate font-heading text-lg font-semibold tracking-tight text-pine lg:text-xl">
            {settings.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-pine"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/agendar"
            className="group inline-flex items-center gap-2 rounded-full bg-pine py-2 pr-2 pl-4 text-sm font-semibold text-cream transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-pine/90 active:scale-[0.98]"
          >
            Agendar cita
            <span className="flex size-6 items-center justify-center rounded-full bg-cream/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>

        <MobileNav links={NAV_LINKS} whatsappHref={whatsappHref} />
      </div>
    </header>
  );
}
