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
