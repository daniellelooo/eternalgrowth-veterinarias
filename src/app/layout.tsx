import type { Metadata } from "next";
import { Bitter, Figtree } from "next/font/google";
import "./globals.css";
import { getClinicSettings } from "@/lib/data/settings";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const FALLBACK_DESCRIPTION =
  "Clínica veterinaria en Medellín. Consulta general, vacunación, desparasitación y agendamiento de citas en línea.";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getClinicSettings();
    const description = settings.description ?? FALLBACK_DESCRIPTION;
    return {
      title: {
        default: settings.name,
        template: `%s · ${settings.name}`,
      },
      description,
    };
  } catch {
    return {
      title: "Veterinaria",
      description: FALLBACK_DESCRIPTION,
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bitter.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
