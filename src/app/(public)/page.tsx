import { getActiveServices, getBusinessHours, getClinicSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/public/site-header";
import { Hero } from "@/components/public/hero";
import { PawTrail } from "@/components/public/paw-trail";
import { ServicesSection } from "@/components/public/services-section";
import { HoursLocationSection } from "@/components/public/hours-location-section";
import { CtaSection } from "@/components/public/cta-section";
import { SiteFooter } from "@/components/public/site-footer";

// La página muestra cupos de agenda reales ("Hoy", horarios libres): no debe
// quedar como HTML estático generado en build, o esa información envejece.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, services, businessHours] = await Promise.all([
    getClinicSettings(),
    getActiveServices(),
    getBusinessHours(),
  ]);

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <Hero settings={settings} services={services} />
        <PawTrail tone="pine" />
        <ServicesSection services={services} />
        <PawTrail tone="pine" />
        <HoursLocationSection settings={settings} businessHours={businessHours} />
        <CtaSection settings={settings} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
