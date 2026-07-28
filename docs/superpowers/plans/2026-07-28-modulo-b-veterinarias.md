# Módulo B Veterinarias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sistema del Módulo B para veterinarias: ficha de mascota con historial de vacunas/desparasitación, agenda de citas con disponibilidad real, panel de administración, sitio de presentación y endpoints de integración para n8n.

**Architecture:** Next.js 16 App Router (single-tenant, un deploy por veterinaria) con Supabase como base de datos y auth del panel admin. Todo acceso a datos ocurre server-side (Server Actions / Route Handlers) con service-role key; RLS deny-all para clientes anónimos. La lógica de disponibilidad de agenda es una función pura testeada con Vitest. n8n se integra por webhook saliente (eventos de cita) y API entrante protegida por API key.

**Tech Stack:** Next.js 16 (App Router, TypeScript strict), Tailwind CSS v4, shadcn/ui, Supabase (CLI local + migrations), `@supabase/ssr`, date-fns v4 + `@date-fns/tz`, Vitest, pnpm.

## Global Constraints

- Directorio del proyecto: `/Users/lelo/Documents/ETERNALGROWTH/Proyectos/NICHOS/veterinarias`. **Es un repositorio git independiente** con remoto `origin` → `https://github.com/daniellelooo/eternalgrowth-veterinarias` (privado). Ya no forma parte del repo `Proyectos`.
- **Los subagentes NO commitean ni pushean.** El orquestador commitea y pushea al cerrar cada fase o feature grande. Los subagentes solo dejan el árbol de trabajo limpio y verificado.
- **Formularios:** shadcn v4 ya no incluye el componente `form` basado en react-hook-form. Usamos los primitivos `Field` (`field.tsx`) + validación con zod en Server Actions (y validación ligera en cliente con `useState`). NO instalar react-hook-form.
- Gestor de paquetes: **pnpm**. Node v25.
- **Todo el copy de UI en español (Colombia). Código, identificadores y commits en inglés (mensajes de commit pueden ser en español, prefijos convencionales `feat:`, `fix:`, `docs:`, `test:`).**
- Zona horaria fija del negocio: `America/Bogota`. Timestamps en DB como `timestamptz`.
- **NO incluir:** ecommerce/carrito, historia clínica regulada (solo fechas de vacuna/desparasitación), facturación DIAN, inventario. Si un subagente lo considera "obvio", está fuera de alcance igual.
- Mobile-first. El sitio público debe funcionar perfecto en 375px de ancho.
- Diseño: los subagentes de UI **DEBEN invocar las skills** `frontend-design:frontend-design` y `high-end-visual-design` antes de escribir JSX/CSS. Nada de diseño genérico de AI (gradientes morados por defecto, emojis como iconos, cards genéricas). Usar iconos `lucide-react`.
- Variables de entorno (definidas en `.env.example` en Task 1): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` (alias moderno si el CLI lo emite), `N8N_WEBHOOK_URL` (opcional), `N8N_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Supabase corre local con `supabase start` (requiere Docker: `open -a Docker` y esperar a que responda `docker info`). **Puertos remapeados a 57321 (API) / 57322 (db) / 57323 (Studio)** porque los default 54321+ ya están ocupados por otros proyectos Supabase en esta máquina (SUBASTAS, opticas, erp-logistico).
- Estados de cita (enum en DB, usar exactamente estos strings): `pendiente | confirmada | atendida | cancelada | inasistencia`. Canales: `web | whatsapp | manual | reactivacion | recordatorio`.
- Cada task termina con `pnpm typecheck && pnpm build` (y `pnpm test` donde haya tests) en verde. No commitear `.env`.

## Fases (checkpoints de commit + revisión)

| Fase | Tasks | Feature |
|---|---|---|
| 1 | 1 | Scaffold ✅ |
| 2 | 2, 3, 4 | Fundación de datos: schema Supabase, motor de agenda, API |
| 3 | 5, 6 | Sitio público + agendamiento |
| 4 | 7, 8, 9, 10 | Panel de administración |
| 5 | 11, 12 | SEO, pulido y documentación |

Al cerrar cada fase: commit + push a `origin/main`, resumen y dev server para revisión.

---

### Task 1: Scaffold del proyecto

**Files:**
- Create: proyecto Next.js completo en `NICHOS/veterinarias/` (`src/app/`, `package.json`, `tsconfig.json`, etc.)
- Create: `.env.example`, `.env.local` (no commitear), `vitest.config.ts`, `README.md`

**Interfaces:**
- Produces: proyecto compilable con `pnpm build`, scripts `dev`, `build`, `typecheck`, `test`; shadcn/ui inicializado; alias `@/*` → `src/*`.

- [ ] **Step 1: Scaffold Next.js**

```bash
cd /Users/lelo/Documents/ETERNALGROWTH/Proyectos/NICHOS/veterinarias
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes
```

(El directorio contiene `docs/`; si create-next-app se queja, scaffoldear en `/tmp` y mover los archivos, preservando `docs/`.)

- [ ] **Step 2: Dependencias**

```bash
pnpm add @supabase/supabase-js @supabase/ssr date-fns @date-fns/tz lucide-react zod
pnpm add -D vitest @vitejs/plugin-react
pnpm dlx shadcn@latest init --yes -b neutral
pnpm dlx shadcn@latest add button input label card dialog select table badge calendar popover form textarea sonner tabs
```

- [ ] **Step 3: Scripts y vitest**

En `package.json` agregar scripts: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`.

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

- [ ] **Step 4: `.env.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
N8N_API_KEY=change-me
ADMIN_EMAIL=admin@veterinaria.local
ADMIN_PASSWORD=admin123
```

Copiar a `.env.local`. Verificar que `.gitignore` cubre `.env*`.

- [ ] **Step 5: Verificar y commitear**

```bash
pnpm typecheck && pnpm build
cd /Users/lelo/Documents/ETERNALGROWTH/Proyectos
git add NICHOS/veterinarias && git commit -m "feat(vet): scaffold Next.js 16 + Tailwind v4 + shadcn + vitest"
```

---

### Task 2: Esquema Supabase, seed y clientes

**Files:**
- Create: `supabase/config.toml` (via `supabase init`), `supabase/migrations/0001_schema.sql`, `supabase/seed.sql`
- Create: `src/lib/supabase/admin.ts`, `src/lib/supabase/server.ts`, `src/lib/types.ts`
- Create: `scripts/create-admin.ts`

**Interfaces:**
- Produces: `createAdminClient(): SupabaseClient` (service role, server-only), `createServerClient(): Promise<SupabaseClient>` (auth con cookies via `@supabase/ssr`), tipos TS de dominio en `src/lib/types.ts` (`Owner`, `Pet`, `HealthRecord`, `Service`, `Appointment`, `AppointmentStatus`, `AppointmentChannel`, `BusinessHour`, `ScheduleBlock`, `ClinicSettings`).

- [ ] **Step 1: Iniciar Supabase local**

```bash
cd /Users/lelo/Documents/ETERNALGROWTH/Proyectos/NICHOS/veterinarias
open -a Docker
until docker info >/dev/null 2>&1; do sleep 2; done
supabase init
supabase start
```

Copiar del output `anon key` y `service_role key` a `.env.local`.

- [ ] **Step 2: Migración `supabase/migrations/0001_schema.sql`**

```sql
create table clinic_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Veterinaria Demo',
  phone text, whatsapp text, address text, email text,
  description text,
  google_maps_url text,
  inactivity_days int not null default 180,
  booking_lead_minutes int not null default 60,
  slot_step_minutes int not null default 30
);

create table owners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  notes text,
  last_visit_at timestamptz,
  created_at timestamptz not null default now()
);

create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  sex text,
  birth_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  type text not null check (type in ('vacuna','desparasitacion')),
  product text,
  applied_at date not null,
  next_due_at date,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_health_next_due on health_records(next_due_at) where next_due_at is not null;

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 30,
  price_cop int,
  active boolean not null default true,
  sort_order int not null default 0
);

create table business_hours (
  id serial primary key,
  weekday int not null check (weekday between 0 and 6), -- 0 = domingo
  open_time time not null,
  close_time time not null
);

create table schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  pet_id uuid references pets(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  pet_name text,
  service_id uuid references services(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pendiente'
    check (status in ('pendiente','confirmada','atendida','cancelada','inasistencia')),
  channel text not null default 'web'
    check (channel in ('web','whatsapp','manual','reactivacion','recordatorio')),
  notes text,
  created_at timestamptz not null default now()
);
create index idx_appointments_starts on appointments(starts_at);

-- RLS: deny-all para anon/authenticated; todo acceso via service role server-side
alter table clinic_settings enable row level security;
alter table owners enable row level security;
alter table pets enable row level security;
alter table health_records enable row level security;
alter table services enable row level security;
alter table business_hours enable row level security;
alter table schedule_blocks enable row level security;
alter table appointments enable row level security;

-- trigger: al marcar cita atendida, actualizar last_visit_at del dueño
create or replace function touch_owner_last_visit() returns trigger as $$
begin
  if new.status = 'atendida' and new.owner_id is not null then
    update owners set last_visit_at = new.starts_at where id = new.owner_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_owner_last_visit
after insert or update of status on appointments
for each row execute function touch_owner_last_visit();
```

- [ ] **Step 3: `supabase/seed.sql`**

```sql
insert into clinic_settings (id, name, phone, whatsapp, address, email, description)
values (1, 'Veterinaria Demo', '604 000 0000', '573000000000',
        'Cra. 43A #10-10, Medellín', 'contacto@veterinaria.local',
        'Clínica veterinaria en Medellín: consulta general, vacunación y desparasitación.');

insert into services (name, description, duration_minutes, price_cop, sort_order) values
 ('Consulta general', 'Valoración completa de tu mascota', 30, 60000, 1),
 ('Vacunación', 'Aplicación de vacunas con registro de refuerzos', 20, 45000, 2),
 ('Desparasitación', 'Control de parásitos internos y externos', 20, 35000, 3),
 ('Baño y peluquería', 'Baño medicado o estético', 60, 50000, 4);

-- Lun-Vie 8:00-18:00, Sáb 8:00-14:00 (weekday 0=domingo)
insert into business_hours (weekday, open_time, close_time) values
 (1,'08:00','18:00'),(2,'08:00','18:00'),(3,'08:00','18:00'),
 (4,'08:00','18:00'),(5,'08:00','18:00'),(6,'08:00','14:00');

-- Datos demo: dueño con mascota y vacuna próxima a vencer
insert into owners (id, full_name, phone, email, last_visit_at) values
 ('11111111-1111-1111-1111-111111111111','Carolina Restrepo','3001234567','caro@example.com', now() - interval '200 days');
insert into pets (id, owner_id, name, species, breed) values
 ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','Rocky','perro','Beagle');
insert into health_records (pet_id, type, product, applied_at, next_due_at) values
 ('22222222-2222-2222-2222-222222222222','vacuna','Rabia', current_date - 350, current_date + 15),
 ('22222222-2222-2222-2222-222222222222','desparasitacion','Triple', current_date - 80, current_date + 10);
```

Aplicar: `supabase db reset` (corre migraciones + seed). Verificar con `psql` o `supabase db diff` que no hay errores.

- [ ] **Step 4: Clientes Supabase**

`src/lib/supabase/admin.ts`:
```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

`src/lib/supabase/server.ts` (para auth admin, patrón oficial `@supabase/ssr` con `cookies()` de Next — usar `getAll`/`setAll`).

- [ ] **Step 5: Tipos de dominio `src/lib/types.ts`**

```ts
export type AppointmentStatus = "pendiente" | "confirmada" | "atendida" | "cancelada" | "inasistencia";
export type AppointmentChannel = "web" | "whatsapp" | "manual" | "reactivacion" | "recordatorio";
export type HealthRecordType = "vacuna" | "desparasitacion";

export interface Owner { id: string; full_name: string; phone: string; email: string | null; notes: string | null; last_visit_at: string | null; created_at: string; }
export interface Pet { id: string; owner_id: string; name: string; species: string; breed: string | null; sex: string | null; birth_date: string | null; notes: string | null; created_at: string; }
export interface HealthRecord { id: string; pet_id: string; type: HealthRecordType; product: string | null; applied_at: string; next_due_at: string | null; notes: string | null; created_at: string; }
export interface Service { id: string; name: string; description: string | null; duration_minutes: number; price_cop: number | null; active: boolean; sort_order: number; }
export interface BusinessHour { id: number; weekday: number; open_time: string; close_time: string; }
export interface ScheduleBlock { id: string; starts_at: string; ends_at: string; reason: string | null; }
export interface Appointment { id: string; owner_id: string | null; pet_id: string | null; customer_name: string; customer_phone: string; pet_name: string | null; service_id: string | null; starts_at: string; ends_at: string; status: AppointmentStatus; channel: AppointmentChannel; notes: string | null; created_at: string; }
export interface ClinicSettings { id: number; name: string; phone: string | null; whatsapp: string | null; address: string | null; email: string | null; description: string | null; google_maps_url: string | null; inactivity_days: number; booking_lead_minutes: number; slot_step_minutes: number; }
```

- [ ] **Step 6: Script admin `scripts/create-admin.ts`**

Usa `createAdminClient().auth.admin.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true })`; idempotente (ignora "already registered"). Script npm: `"create-admin": "npx tsx scripts/create-admin.ts"`. Ejecutarlo y verificar que crea el usuario.

- [ ] **Step 7: Verificar y commitear**

```bash
pnpm typecheck && pnpm build
cd /Users/lelo/Documents/ETERNALGROWTH/Proyectos
git add NICHOS/veterinarias && git commit -m "feat(vet): supabase schema, seed, clients y admin user script"
```

---

### Task 3: Motor de disponibilidad (TDD)

**Files:**
- Create: `src/lib/availability.ts`
- Test: `tests/availability.test.ts`

**Interfaces:**
- Produces:
```ts
export interface BusyInterval { start: Date; end: Date; }
export interface AvailabilityInput {
  date: string;                 // 'YYYY-MM-DD' en tz del negocio
  durationMinutes: number;
  businessHours: { weekday: number; open_time: string; close_time: string }[];
  busy: BusyInterval[];
  now: Date;
  leadMinutes?: number;         // default 60
  stepMinutes?: number;         // default 30
  timezone?: string;            // default 'America/Bogota'
}
export function computeAvailableSlots(input: AvailabilityInput): Date[]; // inicios de slot, orden asc
```

- [ ] **Step 1: Escribir tests que fallan** — `tests/availability.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "@/lib/availability";

const HOURS = [{ weekday: 2, open_time: "08:00", close_time: "12:00" }]; // martes
const PAST = new Date("2026-07-20T00:00:00-05:00"); // 'now' muy anterior
const TUESDAY = "2026-07-28"; // martes

const iso = (d: Date) => d.toISOString();

describe("computeAvailableSlots", () => {
  it("genera slots cada 30 min dentro del horario", () => {
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 30, businessHours: HOURS, busy: [], now: PAST });
    expect(slots).toHaveLength(8); // 8:00..11:30
    expect(iso(slots[0])).toBe("2026-07-28T13:00:00.000Z"); // 08:00 -05
    expect(iso(slots[7])).toBe("2026-07-28T16:30:00.000Z"); // 11:30 -05
  });

  it("el servicio debe caber antes del cierre", () => {
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 60, businessHours: HOURS, busy: [], now: PAST });
    expect(iso(slots.at(-1)!)).toBe("2026-07-28T16:00:00.000Z"); // último 11:00
  });

  it("excluye slots que chocan con citas existentes", () => {
    const busy = [{ start: new Date("2026-07-28T14:00:00.000Z"), end: new Date("2026-07-28T14:30:00.000Z") }]; // 9:00-9:30
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 30, businessHours: HOURS, busy, now: PAST });
    expect(slots.map(iso)).not.toContain("2026-07-28T14:00:00.000Z");
    expect(slots).toHaveLength(7);
  });

  it("un servicio largo no cabe sobre una cita intermedia", () => {
    const busy = [{ start: new Date("2026-07-28T14:00:00.000Z"), end: new Date("2026-07-28T14:30:00.000Z") }];
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 60, businessHours: HOURS, busy, now: PAST });
    // CORREGIDO: citas consecutivas (back-to-back) son válidas, no solapan.
    expect(slots.map(iso)).not.toContain("2026-07-28T13:30:00.000Z"); // 8:30-9:30 solapa
    expect(slots.map(iso)).not.toContain("2026-07-28T14:00:00.000Z"); // 9:00-10:00 solapa
    expect(slots.map(iso)).toContain("2026-07-28T13:00:00.000Z");     // 8:00-9:00 consecutivo, válido
    expect(slots.map(iso)).toContain("2026-07-28T14:30:00.000Z");     // 9:30 tras la cita, válido
  });

  it("día sin horario configurado devuelve []", () => {
    const slots = computeAvailableSlots({ date: "2026-07-26", durationMinutes: 30, businessHours: HOURS, busy: [], now: PAST }); // domingo
    expect(slots).toEqual([]);
  });

  it("excluye slots pasados y respeta leadMinutes", () => {
    const now = new Date("2026-07-28T14:10:00.000Z"); // 9:10 local
    const slots = computeAvailableSlots({ date: TUESDAY, durationMinutes: 30, businessHours: HOURS, busy: [], now, leadMinutes: 60 });
    // mínimo arranque: 10:10 → primer slot 10:30
    expect(iso(slots[0])).toBe("2026-07-28T15:30:00.000Z");
  });
});
```

- [ ] **Step 2: Correr y ver fallar** — `pnpm test` → FAIL (módulo no existe).

- [ ] **Step 3: Implementar `src/lib/availability.ts`**

```ts
import { TZDate } from "@date-fns/tz";
import { addMinutes } from "date-fns";

export interface BusyInterval { start: Date; end: Date; }
export interface AvailabilityInput {
  date: string;
  durationMinutes: number;
  businessHours: { weekday: number; open_time: string; close_time: string }[];
  busy: BusyInterval[];
  now: Date;
  leadMinutes?: number;
  stepMinutes?: number;
  timezone?: string;
}

const overlaps = (aS: Date, aE: Date, bS: Date, bE: Date) => aS < bE && bS < aE;

export function computeAvailableSlots(input: AvailabilityInput): Date[] {
  const tz = input.timezone ?? "America/Bogota";
  const step = input.stepMinutes ?? 30;
  const lead = input.leadMinutes ?? 60;
  const [y, m, d] = input.date.split("-").map(Number);
  const weekday = new TZDate(y, m - 1, d, tz).getDay();
  const windows = input.businessHours.filter((h) => h.weekday === weekday);
  if (windows.length === 0) return [];

  const minStart = addMinutes(input.now, lead);
  const slots: Date[] = [];
  for (const w of windows) {
    const [oh, om] = w.open_time.split(":").map(Number);
    const [ch, cm] = w.close_time.split(":").map(Number);
    const open = new TZDate(y, m - 1, d, oh, om, tz);
    const close = new TZDate(y, m - 1, d, ch, cm, tz);
    for (let s = new Date(open); addMinutes(s, input.durationMinutes) <= close; s = addMinutes(s, step)) {
      const e = addMinutes(s, input.durationMinutes);
      if (s < minStart) continue;
      if (input.busy.some((b) => overlaps(s, e, b.start, b.end))) continue;
      slots.push(new Date(s));
    }
  }
  return slots.sort((a, b) => a.getTime() - b.getTime());
}
```

- [ ] **Step 4: Correr tests** — `pnpm test` → 6 passed. Si el cálculo de `weekday` falla por tz, corregir usando la fecha a mediodía local: `new TZDate(y, m-1, d, 12, 0, tz).getDay()`.

- [ ] **Step 5: Commit** — `git add NICHOS/veterinarias && git commit -m "feat(vet): motor de disponibilidad de agenda con TDD"`

---

### Task 4: Capa de datos y API (availability + booking + n8n)

**Files:**
- Create: `src/lib/data/settings.ts`, `src/lib/data/appointments.ts`, `src/lib/data/availability.ts`, `src/lib/n8n.ts`
- Create: `src/app/api/availability/route.ts`
- Create: `src/app/api/n8n/reminders/route.ts`, `src/app/api/n8n/inactive/route.ts`, `src/app/api/n8n/appointments/route.ts`, `src/app/api/n8n/appointments/[id]/route.ts`

**Interfaces:**
- Consumes: `createAdminClient()` (Task 2), `computeAvailableSlots` (Task 3), tipos de `src/lib/types.ts`.
- Produces:
  - `getClinicSettings(): Promise<ClinicSettings>` (con cache `unstable_cache` o fetch directo, TTL corto)
  - `getActiveServices(): Promise<Service[]>`
  - `getAvailableSlotsForDate(dateISO: string, serviceId: string): Promise<{ startsAt: string }[]>` — carga horas, citas del día (status != cancelada), bloques; llama al motor.
  - `createPublicAppointment(input: { serviceId: string; startsAt: string; customerName: string; customerPhone: string; petName?: string; notes?: string }): Promise<{ id: string } | { error: string }>` — valida con zod, re-verifica que el slot sigue libre (releer citas y recomputar), inserta con `channel:'web'`, `status:'pendiente'`, dispara `notifyN8n('appointment.created', appointment)`.
  - `notifyN8n(event: string, payload: unknown): Promise<void>` — POST a `N8N_WEBHOOK_URL` con `{ event, payload, sentAt }`; try/catch silencioso, timeout 5s; no-op si no hay URL.

- [ ] **Step 1: Implementar `src/lib/n8n.ts`** con `fetch` + `AbortSignal.timeout(5000)`.

- [ ] **Step 2: Implementar capa de datos** (queries con `createAdminClient()`, sin RLS porque es service role). En `getAvailableSlotsForDate`, busy = citas del día con `status in ('pendiente','confirmada','atendida')` + `schedule_blocks` que intersecten el día.

- [ ] **Step 3: Route handler público `GET /api/availability?date=YYYY-MM-DD&serviceId=uuid`** → `{ slots: string[] }` (ISO). Validar params con zod; 400 si inválidos.

- [ ] **Step 4: API n8n.** Todas exigen header `Authorization: Bearer ${N8N_API_KEY}` (401 si no). Helper compartido `requireN8nAuth(req)`.
  - `GET /api/n8n/reminders?days=15` → health_records con `next_due_at <= today+days`, join pet+owner: `[{ record_id, type, product, next_due_at, pet_name, species, owner_name, phone }]`
  - `GET /api/n8n/inactive` → owners con `last_visit_at < now() - inactivity_days` (de settings) o `last_visit_at is null`, con sus mascotas: `[{ owner_id, owner_name, phone, last_visit_at, pets: [{name, species}] }]`
  - `GET /api/n8n/appointments?from=ISO&to=ISO&status=confirmada` → citas para recordatorio 24h: `[{ id, customer_name, customer_phone, pet_name, service_name, starts_at, status }]`
  - `PATCH /api/n8n/appointments/:id` body `{ status }` (zod: uno de los 5 estados) → actualiza y devuelve la cita; dispara `notifyN8n('appointment.status_changed', ...)`.

- [ ] **Step 5: Verificación manual con Supabase corriendo:**

```bash
pnpm dev &
curl "http://localhost:3000/api/availability?date=<próximo martes>&serviceId=<uuid de seed>"   # → slots
curl -H "Authorization: Bearer change-me" "http://localhost:3000/api/n8n/reminders?days=30"    # → Rocky (2 registros)
curl "http://localhost:3000/api/n8n/reminders" # → 401
```

- [ ] **Step 6: `pnpm typecheck && pnpm build && pnpm test`, commit** — `feat(vet): capa de datos, API de disponibilidad y endpoints n8n`

---

### Task 5: Sitio público de presentación (DISEÑO)

**Files:**
- Create: `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`
- Create: `src/components/public/*` (header, hero, services, hours-location, cta, footer — a criterio del diseñador)
- Modify: `src/app/layout.tsx` (fuentes, metadata base)

**Interfaces:**
- Consumes: `getClinicSettings()`, `getActiveServices()` (Task 4). Server Components; los datos vienen de DB, nada hardcodeado salvo copy estructural.
- Produces: landing en `/` con CTA "Agendar cita" → `/agendar` y botón WhatsApp (`https://wa.me/{whatsapp}`).

**REQUIRED SUB-SKILLS antes de escribir código:** `frontend-design:frontend-design` y `high-end-visual-design`.

- [ ] **Step 1: Invocar skills de diseño y definir dirección visual** (tipografía distintiva vía `next/font` — p.ej. una serif display + sans humanista; paleta cálida y profesional apta para veterinaria, NO morados genéricos; documentar tokens en `globals.css`).

- [ ] **Step 2: Construir la landing.** Secciones obligatorias con este contenido:
  - **Header**: nombre de la clínica (de settings), nav ancla (Servicios, Horarios, Ubicación), CTA "Agendar cita".
  - **Hero**: titular sobre el cuidado de la mascota + subtítulo con `description` de settings + 2 CTAs (Agendar cita / WhatsApp).
  - **Servicios**: cards desde `getActiveServices()` con nombre, descripción, duración y precio formateado COP (`Intl.NumberFormat('es-CO')`).
  - **Horarios y ubicación**: horarios desde `business_hours` (formatear "Lunes a viernes 8:00 a.m. – 6:00 p.m." agrupando días iguales), dirección, link a Google Maps si existe.
  - **CTA final** + **Footer** (nombre, teléfono, WhatsApp, dirección).
- [ ] **Step 3: Responsive 375px→1440px, sin overflow horizontal.** Verificar con Playwright screenshot o browser si disponible.
- [ ] **Step 4: `pnpm typecheck && pnpm build`, commit** — `feat(vet): sitio público de presentación`

---

### Task 6: Flujo de agendamiento público (DISEÑO)

**Files:**
- Create: `src/app/(public)/agendar/page.tsx`, `src/app/(public)/agendar/confirmacion/page.tsx`
- Create: `src/components/booking/booking-wizard.tsx` (client component) y subcomponentes
- Create: `src/app/(public)/agendar/actions.ts` (server action que envuelve `createPublicAppointment`)

**Interfaces:**
- Consumes: `GET /api/availability` (fetch client-side al elegir fecha), `createPublicAppointment` (Task 4), `getActiveServices()`.
- Produces: wizard de 3 pasos: (1) servicio → (2) fecha + hora → (3) datos (nombre, celular, nombre de mascota, nota opcional) → confirmación.

**REQUIRED SUB-SKILLS:** `frontend-design:frontend-design` y `high-end-visual-design` (mantener los tokens de Task 5).

- [ ] **Step 1: Wizard.** Paso 2: selector de fecha (próximos 14 días, deshabilitar días sin horario) + grid de horas desde `/api/availability` formateadas "9:30 a.m." (`es-CO`, tz Bogotá); estados de carga y "No hay horarios disponibles este día". Paso 3: validación zod client+server (celular colombiano: 10 dígitos empezando en 3), server action, redirect a `/agendar/confirmacion?id=...`.
- [ ] **Step 2: Página de confirmación**: resume servicio, fecha/hora, nombre; mensaje "Te llegará confirmación por WhatsApp"; botón volver al inicio.
- [ ] **Step 3: Probar flujo completo con dev server + Supabase** (crear cita real, verificar fila en DB y que el slot desaparece de availability).
- [ ] **Step 4: `pnpm typecheck && pnpm build`, commit** — `feat(vet): flujo de agendamiento público`

---

### Task 7: Auth admin y shell del panel

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`
- Create: `src/app/admin/(dashboard)/layout.tsx` (sidebar nav), `src/app/admin/(dashboard)/page.tsx` (dashboard home)
- Create: `src/middleware.ts` (protege `/admin/*` excepto `/admin/login`)
- Create: `src/lib/data/dashboard.ts`

**Interfaces:**
- Consumes: `createServerClient()` (Task 2, auth con cookies), datos de Tasks 4.
- Produces: sesión admin funcional; layout con nav a: Inicio, Agenda, Fichas, Recordatorios, Ajustes; `getDashboardStats(): Promise<{ citasHoy: number; citasPendientes: number; recordatoriosProximos: number; clientesInactivos: number }>`.

- [ ] **Step 1: Middleware** patrón oficial `@supabase/ssr` (refresh de sesión + redirect a `/admin/login` si no hay user en rutas `/admin/*`). No proteger rutas públicas ni `/api/*`.
- [ ] **Step 2: Login** (email/password, server action `signInWithPassword`, error en español "Credenciales incorrectas"). Logout en el layout.
- [ ] **Step 3: Layout del panel** (sidebar colapsable en móvil, shadcn) + dashboard home con las 4 stats y lista de próximas citas de hoy.
- [ ] **Step 4: Probar login con el usuario de `create-admin`**, verificar redirect y logout.
- [ ] **Step 5: `pnpm typecheck && pnpm build`, commit** — `feat(vet): auth y shell del panel admin`

---

### Task 8: Admin — Fichas (dueños, mascotas, historial)

**Files:**
- Create: `src/app/admin/(dashboard)/fichas/page.tsx` (lista + búsqueda), `src/app/admin/(dashboard)/fichas/[ownerId]/page.tsx` (detalle dueño + mascotas + historial)
- Create: `src/app/admin/(dashboard)/fichas/actions.ts`
- Create: `src/lib/data/owners.ts`, `src/lib/data/pets.ts`, `src/lib/data/health.ts`
- Create: componentes de formulario en `src/components/admin/`

**Interfaces:**
- Consumes: tipos Task 2, `createAdminClient()`.
- Produces server actions (todas validan sesión admin con `createServerClient` antes de operar):
  - `createOwner`, `updateOwner`, `deleteOwner`
  - `createPet(ownerId, ...)`, `updatePet`, `deletePet`
  - `addHealthRecord(petId, { type, product, applied_at, next_due_at, notes })`, `updateHealthRecord`, `deleteHealthRecord`
  - `searchOwners(q: string)` — por nombre, teléfono o nombre de mascota.

- [ ] **Step 1: Lista de fichas** con búsqueda (server-side, `ilike`), tabla: dueño, teléfono, mascotas (badges), última visita; botón "Nueva ficha" (dialog dueño + primera mascota en un solo form).
- [ ] **Step 2: Detalle de dueño**: datos editables, mascotas en cards; por mascota, historial de vacunas/desparasitación en tabla con badge de estado (vencida = `next_due_at < hoy` en rojo, próxima ≤15 días en ámbar) y form para agregar registro.
- [ ] **Step 3: Probar CRUD completo contra DB local** (crear dueño→mascota→registro, editar, borrar).
- [ ] **Step 4: `pnpm typecheck && pnpm build`, commit** — `feat(vet): fichas de dueños, mascotas e historial sanitario`

---

### Task 9: Admin — Agenda y gestión de citas

**Files:**
- Create: `src/app/admin/(dashboard)/agenda/page.tsx` (vista día/semana con navegación de fechas)
- Create: `src/app/admin/(dashboard)/agenda/actions.ts`
- Create: `src/lib/data/schedule.ts`
- Create: componentes en `src/components/admin/agenda/`

**Interfaces:**
- Consumes: Tasks 4 y 8 (`searchOwners` para vincular cita a ficha).
- Produces:
  - `createManualAppointment` (channel `manual`, permite vincular owner/pet existentes o solo nombre/teléfono)
  - `updateAppointmentStatus(id, status)` — dispara `notifyN8n('appointment.status_changed', ...)`
  - `cancelAppointment`, `rescheduleAppointment(id, startsAt)` (re-verifica disponibilidad)
  - `createScheduleBlock`, `deleteScheduleBlock`
  - `getAppointmentsForRange(fromISO, toISO): Promise<AppointmentWithService[]>`

- [ ] **Step 1: Vista de agenda**: columna de horas (según business_hours del día), citas como tarjetas con color por status (pendiente=ámbar, confirmada=azul/verde del sistema, atendida=verde, cancelada/inasistencia=gris tachado), navegación día anterior/siguiente + selector fecha; toggle día/semana (semana solo desktop).
- [ ] **Step 2: Acciones sobre cita**: dialog con detalle; cambiar estado (los 5), reagendar (reusa slots de availability), notas. Crear cita manual desde botón "+".
- [ ] **Step 3: Bloqueos de horario**: form simple (rango + motivo), visibles en la agenda, borrables.
- [ ] **Step 4: Probar**: crear cita manual, cambiar estados, verificar que `atendida` actualiza `last_visit_at` del dueño (trigger), bloquear horario y verificar que `/api/availability` lo excluye.
- [ ] **Step 5: `pnpm typecheck && pnpm build`, commit** — `feat(vet): agenda admin y gestión de citas`

---

### Task 10: Admin — Recordatorios y Ajustes

**Files:**
- Create: `src/app/admin/(dashboard)/recordatorios/page.tsx`
- Create: `src/app/admin/(dashboard)/ajustes/page.tsx`, `src/app/admin/(dashboard)/ajustes/actions.ts`
- Create: `src/lib/data/reminders.ts`

**Interfaces:**
- Consumes: Task 4 (`getClinicSettings`), Task 8 data layer.
- Produces:
  - `getUpcomingReminders(days: number)` — mismos datos que `/api/n8n/reminders` (reusar una función común)
  - `getInactiveOwners()` — mismos datos que `/api/n8n/inactive` (reusar)
  - `updateClinicSettings`, `updateService`/`createService`/`deactivateService`, `updateBusinessHours`

- [ ] **Step 1: Página Recordatorios**, dos tabs: (a) "Vacunas y desparasitación" — tabla próximos 30 días con dueño, teléfono, mascota, tipo, fecha, badge vencida/próxima, botón por fila "Abrir WhatsApp" (`wa.me` con mensaje prellenado "Hola {nombre}, te recordamos que a {mascota} le corresponde su {tipo} el {fecha}"); (b) "Clientes inactivos" — tabla con última visita y botón WhatsApp de reactivación. Nota visible: "Los mensajes automáticos se envían por n8n; esta vista permite seguimiento manual."
- [ ] **Step 2: Página Ajustes**: datos de la clínica (form settings), servicios (CRUD en tabla editable), horarios de atención (editor por día), campo "días para considerar cliente inactivo".
- [ ] **Step 3: Probar con seed** (Rocky debe aparecer en recordatorios; Carolina en inactivos con default 180 días).
- [ ] **Step 4: `pnpm typecheck && pnpm build`, commit** — `feat(vet): recordatorios, reactivación y ajustes`

---

### Task 11: SEO, performance y pulido responsive

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/(public)/page.tsx` (metadata, OG)
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx` (o estático)
- Modify: lo que el audit encuentre

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: sitio con metadata completa (title template, description, OG/Twitter), JSON-LD `VeterinaryCare` en la landing (nombre, dirección, teléfono, horarios desde settings), sitemap y robots (excluir `/admin` y `/api`), imágenes `next/image`, fuentes con `display: swap`.

- [ ] **Step 1: Metadata + JSON-LD + sitemap/robots.**
- [ ] **Step 2: Audit responsive y de accesibilidad** (labels en forms, contraste, focus states, `aria` en el wizard). Revisar consola sin errores en `/`, `/agendar`, `/admin/login` y panel.
- [ ] **Step 3: Build de producción `pnpm build`** — revisar que la landing sea estática o streaming razonable, sin warnings de tamaño absurdos.
- [ ] **Step 4: Commit** — `feat(vet): SEO técnico, JSON-LD y pulido responsive`

---

### Task 12: Documentación y cierre

**Files:**
- Create/Modify: `README.md` (setup local, env vars, scripts, deploy a Vercel + Supabase cloud, contratos de la API n8n con ejemplos curl para Rochy)
- Create: `docs/n8n-integration.md` (payloads de webhook saliente + endpoints entrantes, para el responsable de automatización)

- [ ] **Step 1: README completo** (requisitos, `supabase start`, `db reset`, `create-admin`, `pnpm dev`; sección deploy: crear proyecto Supabase cloud, `supabase db push`, envs en Vercel, deploy).
- [ ] **Step 2: `docs/n8n-integration.md`** con todos los contratos: eventos salientes (`appointment.created`, `appointment.status_changed`) con payload JSON de ejemplo, y los 4 endpoints entrantes con curl.
- [ ] **Step 3: Verificación final completa**: `pnpm test && pnpm typecheck && pnpm build` + smoke manual del flujo público y admin.
- [ ] **Step 4: Commit** — `docs(vet): README y guía de integración n8n`

---

## Fuera del alcance de este plan (manual / requiere al usuario)

- Deploy real a Vercel + Supabase cloud (requiere crear proyecto Supabase y login Vercel) — documentado en README; se ofrece al usuario al terminar.
- Flujos n8n (responsable: Rochy) — este plan entrega los contratos y endpoints.
- Google My Business, marketing, pauta (responsables: Fade/equipo).
