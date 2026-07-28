export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "atendida"
  | "cancelada"
  | "inasistencia";

export type AppointmentChannel =
  | "web"
  | "whatsapp"
  | "manual"
  | "reactivacion"
  | "recordatorio";

export type HealthRecordType = "vacuna" | "desparasitacion";

export interface Owner {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  last_visit_at: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birth_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  pet_id: string;
  type: HealthRecordType;
  product: string | null;
  applied_at: string;
  next_due_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cop: number | null;
  active: boolean;
  sort_order: number;
}

export interface BusinessHour {
  id: number;
  weekday: number;
  open_time: string;
  close_time: string;
}

export interface ScheduleBlock {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

export interface Appointment {
  id: string;
  owner_id: string | null;
  pet_id: string | null;
  customer_name: string;
  customer_phone: string;
  pet_name: string | null;
  service_id: string | null;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  channel: AppointmentChannel;
  notes: string | null;
  created_at: string;
}

export interface ClinicSettings {
  id: number;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  email: string | null;
  description: string | null;
  google_maps_url: string | null;
  inactivity_days: number;
  booking_lead_minutes: number;
  slot_step_minutes: number;
}
