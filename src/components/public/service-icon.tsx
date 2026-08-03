import { Bug, Droplets, PawPrint, Stethoscope, Syringe, type LucideIcon } from "lucide-react";

const DIACRITICS = /[̀-ͯ]/g;

function normalize(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

/**
 * Elige un ícono lucide-react según palabras clave en el nombre del
 * servicio (los servicios vienen de la DB, así que esto es heurístico con
 * una huella de pata como respaldo genérico).
 */
export function getServiceIcon(name: string): LucideIcon {
  const n = normalize(name);
  if (n.includes("consulta") || n.includes("valoracion")) return Stethoscope;
  if (n.includes("vacun")) return Syringe;
  if (n.includes("despar") || n.includes("parasit")) return Bug;
  if (n.includes("bano") || n.includes("peluqu") || n.includes("estetic")) return Droplets;
  return PawPrint;
}
