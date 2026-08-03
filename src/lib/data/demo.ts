import type { BusinessHour, ClinicSettings, Service } from "@/lib/types";

/**
 * Modo demo: se activa solo cuando NO hay Supabase configurado (el caso del
 * despliegue de vista previa en Vercel). Sirve el sitio con los mismos datos
 * del seed, quemados en código, para poder revisar el diseño sin base de
 * datos. En cuanto se definan NEXT_PUBLIC_SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY, el sitio vuelve solo a leer datos reales sin
 * tocar una línea de código.
 */
export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Espejo de supabase/seed.sql + defaults de la migración 0001. */
export const DEMO_SETTINGS: ClinicSettings = {
  id: 1,
  name: "Veterinaria Demo",
  phone: "604 000 0000",
  whatsapp: "573000000000",
  address: "Cra. 43A #10-10, Medellín",
  email: "contacto@veterinaria.local",
  description:
    "Clínica veterinaria en Medellín: consulta general, vacunación y desparasitación.",
  google_maps_url: null,
  inactivity_days: 180,
  booking_lead_minutes: 60,
  slot_step_minutes: 30,
};

/**
 * Los ids son UUID fijos porque el esquema de validación de la cita exige
 * uuid; al ser constantes, un enlace de confirmación demo sigue resolviendo
 * el servicio correcto entre despliegues.
 */
export const DEMO_SERVICES: Service[] = [
  {
    id: "aaaaaaaa-0000-4000-8000-000000000001",
    name: "Consulta general",
    description: "Valoración completa de tu mascota",
    duration_minutes: 30,
    price_cop: 60000,
    active: true,
    sort_order: 1,
  },
  {
    id: "aaaaaaaa-0000-4000-8000-000000000002",
    name: "Vacunación",
    description: "Aplicación de vacunas con registro de refuerzos",
    duration_minutes: 20,
    price_cop: 45000,
    active: true,
    sort_order: 2,
  },
  {
    id: "aaaaaaaa-0000-4000-8000-000000000003",
    name: "Desparasitación",
    description: "Control de parásitos internos y externos",
    duration_minutes: 20,
    price_cop: 35000,
    active: true,
    sort_order: 3,
  },
  {
    id: "aaaaaaaa-0000-4000-8000-000000000004",
    name: "Baño y peluquería",
    description: "Baño medicado o estético",
    duration_minutes: 60,
    price_cop: 50000,
    active: true,
    sort_order: 4,
  },
];

/** Lun-Vie 8:00-18:00, Sáb 8:00-14:00 (weekday 0=domingo, domingo cerrado). */
export const DEMO_BUSINESS_HOURS: BusinessHour[] = [
  { id: 1, weekday: 1, open_time: "08:00", close_time: "18:00" },
  { id: 2, weekday: 2, open_time: "08:00", close_time: "18:00" },
  { id: 3, weekday: 3, open_time: "08:00", close_time: "18:00" },
  { id: 4, weekday: 4, open_time: "08:00", close_time: "18:00" },
  { id: 5, weekday: 5, open_time: "08:00", close_time: "18:00" },
  { id: 6, weekday: 6, open_time: "08:00", close_time: "14:00" },
];

export interface DemoAppointmentPayload {
  serviceId: string;
  startsAt: string;
  customerName: string;
  petName: string | null;
}

const DEMO_ID_PREFIX = "demo_";

/**
 * En modo demo no hay dónde guardar la cita, así que el "id" que viaja a la
 * página de confirmación lleva dentro el resumen. Es solo para la vista
 * previa: no es un identificador real ni sustituye a la base de datos.
 */
export function encodeDemoAppointment(payload: DemoAppointmentPayload): string {
  const json = JSON.stringify(payload);
  return DEMO_ID_PREFIX + Buffer.from(json, "utf8").toString("base64url");
}

export function decodeDemoAppointment(id: string): DemoAppointmentPayload | null {
  if (!id.startsWith(DEMO_ID_PREFIX)) return null;

  try {
    const json = Buffer.from(id.slice(DEMO_ID_PREFIX.length), "base64url").toString(
      "utf8"
    );
    const parsed = JSON.parse(json) as DemoAppointmentPayload;

    if (
      typeof parsed?.serviceId !== "string" ||
      typeof parsed?.startsAt !== "string" ||
      typeof parsed?.customerName !== "string" ||
      Number.isNaN(new Date(parsed.startsAt).getTime())
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
