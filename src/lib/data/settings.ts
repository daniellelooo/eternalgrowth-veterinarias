import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessHour, ClinicSettings, Service } from "@/lib/types";

/**
 * Configuración única de la clínica (fila id=1). Lanza si no existe: la fila
 * se crea vía seed/migración y no debería faltar en un entorno correcto.
 */
export async function getClinicSettings(): Promise<ClinicSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error("No se pudo cargar la configuración de la clínica.");
  }

  return data as ClinicSettings;
}

/** Servicios activos, ordenados para mostrar en el sitio público y el wizard. */
export async function getActiveServices(): Promise<Service[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar los servicios.");
  }

  return (data ?? []) as Service[];
}

/**
 * Horarios de atención (tabla business_hours), ordenados por día de la
 * semana (0=domingo) y hora de apertura. Usado por el sitio público para
 * mostrar horarios y por el motor de disponibilidad.
 */
export async function getBusinessHours(): Promise<BusinessHour[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .order("weekday", { ascending: true })
    .order("open_time", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar los horarios de atención.");
  }

  return (data ?? []) as BusinessHour[];
}
