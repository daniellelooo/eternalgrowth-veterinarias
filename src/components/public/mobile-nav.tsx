"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({ links, whatsappHref }: { links: NavLink[]; whatsappHref: string | null }) {
  const [open, setOpen] = useState(false);

  // Cierra el panel al navegar por un ancla o al presionar Escape.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center rounded-full text-pine transition-colors hover:bg-pine/8"
      >
        <Menu
          className={cn(
            "absolute size-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "rotate-45 opacity-0" : "rotate-0 opacity-100"
          )}
        />
        <X
          className={cn(
            "absolute size-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "rotate-0 opacity-100" : "-rotate-45 opacity-0"
          )}
        />
      </button>

      <div
        id="mobile-nav-panel"
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top border-b border-ink/10 bg-sand shadow-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-pine/8"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-3 border-t border-ink/10 px-6 py-6">
          <Button asChild size="lg" className="w-full bg-pine text-cream hover:bg-pine/90">
            <Link href="/agendar" onClick={() => setOpen(false)}>
              Agendar cita
            </Link>
          </Button>
          {whatsappHref && (
            <Button asChild variant="outline" size="lg" className="w-full border-pine/25 text-pine">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                Escribir por WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
