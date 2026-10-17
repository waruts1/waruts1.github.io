-- Paid hotspot MVP schema for Supabase Postgres.
-- Apply in the Supabase SQL editor after reviewing. No secrets belong in this file.
create extension if not exists pgcrypto;

create table if not exists public.hotspot_plans (
  id text primary key,
  name text not null,
  duration_minutes integer not null check (duration_minutes between 1 and 10080),
  price_kes numeric(10,2) not null check (price_kes > 0),
  download_mbps numeric(6,2) not null default 1 check (download_mbps > 0),
  upload_mbps numeric(6,2) not null default 1 check (upload_mbps > 0),
  max_devices integer not null default 1 check (max_devices between 1 and 10),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.hotspot_plans (id,name,duration_minutes,price_kes,download_mbps,upload_mbps)
values ('hour-1','Quick Browse',60,10,1,1),
       ('hour-3','Stay Awhile',180,25,1,1),
       ('hour-6','Long Session',360,40,1,1)
on conflict (id) do nothing;

create table if not exists public.hotspot_payments (
  id uuid primary key default gen_random_uuid(),
  receipt_code text not null unique,
  phone_e164 text not null,
  plan_id text not null references public.hotspot_plans(id),
  amount_kes numeric(10,2) not null check (amount_kes > 0),
  mpesa_transaction_id text unique,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','provisioning_failed')),
  confirmed_at timestamptz,
  raw_payment_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.hotspot_sessions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.hotspot_payments(id),
  plan_id text not null references public.hotspot_plans(id),
  phone_e164 text not null,
  device_mac text,
  router_client_id text,
  status text not null default 'pending' check (status in ('pending','active','expired','revoked','provisioning_failed')),
  started_at timestamptz,
  expires_at timestamptz,
  download_mbps numeric(6,2) not null default 1,
  upload_mbps numeric(6,2) not null default 1,
  bytes_in bigint not null default 0,
  bytes_out bigint not null default 0,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at is null or started_at is null or expires_at > started_at)
);

create index if not exists hotspot_sessions_active_expiry_idx
  on public.hotspot_sessions (expires_at) where status = 'active';
create index if not exists hotspot_sessions_phone_idx
  on public.hotspot_sessions (phone_e164, created_at desc);

create table if not exists public.hotspot_audit_log (
  id bigint generated always as identity primary key,
  actor text not null default 'system',
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.hotspot_plans enable row level security;
alter table public.hotspot_payments enable row level security;
alter table public.hotspot_sessions enable row level security;
alter table public.hotspot_audit_log enable row level security;

-- Anonymous users may see active plan descriptions only.
drop policy if exists "public can read active hotspot plans" on public.hotspot_plans;
create policy "public can read active hotspot plans"
  on public.hotspot_plans for select to anon, authenticated using (is_active = true);

-- Admin access requires a trusted app_metadata role set server-side, never user-editable user_metadata.
drop policy if exists "hotspot admins manage plans" on public.hotspot_plans;
create policy "hotspot admins manage plans"
  on public.hotspot_plans for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "hotspot admins read payments" on public.hotspot_payments;
create policy "hotspot admins read payments"
  on public.hotspot_payments for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "hotspot admins read sessions" on public.hotspot_sessions;
create policy "hotspot admins read sessions"
  on public.hotspot_sessions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "hotspot admins update sessions" on public.hotspot_sessions;
create policy "hotspot admins update sessions"
  on public.hotspot_sessions for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "hotspot admins read audit log" on public.hotspot_audit_log;
create policy "hotspot admins read audit log"
  on public.hotspot_audit_log for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Intentionally no anon/authenticated write policies on payments, sessions or audit logs.
-- The backend uses the Supabase service-role key stored only in server environment variables.
