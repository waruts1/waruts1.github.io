-- Portfolio analytics schema for Supabase/PostgreSQL.
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  session_id text not null,
  event_name text not null check (event_name in (
    'page_view',
    'section_view',
    'project_view',
    'github_click',
    'cv_view',
    'cv_download',
    'contact_open',
    'contact_submit',
    'outbound_click'
  )),
  path text,
  referrer text,
  source text,
  medium text,
  campaign text,
  target text,
  metadata jsonb not null default '{}'::jsonb,
  country_code text,
  device_type text,
  browser text,
  os text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_visitor_id_idx on public.analytics_events (visitor_id, created_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_source_idx on public.analytics_events (source, created_at desc);
create index if not exists analytics_events_path_idx on public.analytics_events (path, created_at desc);

-- No direct anonymous access. The tracking Edge Function inserts with the service role.
alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from anon;
revoke all on table public.analytics_events from authenticated;

drop policy if exists analytics_events_admin_read on public.analytics_events;
create policy analytics_events_admin_read
on public.analytics_events
for select
to authenticated
using (auth.role() = 'authenticated');

-- Dashboard-friendly aggregate RPC. Authenticated users only.
create or replace function public.analytics_overview(days integer default 30)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  since_at timestamptz := now() - make_interval(days => greatest(days, 1));
  result jsonb;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'not authenticated';
  end if;

  select jsonb_build_object(
    'visitors', (select count(distinct visitor_id) from analytics_events where created_at >= since_at),
    'page_views', (select count(*) from analytics_events where event_name = 'page_view' and created_at >= since_at),
    'github_clicks', (select count(*) from analytics_events where event_name = 'github_click' and created_at >= since_at),
    'contact_submits', (select count(*) from analytics_events where event_name = 'contact_submit' and created_at >= since_at),
    'cv_views', (select count(*) from analytics_events where event_name in ('cv_view','cv_download') and created_at >= since_at),
    'sources', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(nullif(source,''),'direct') as source, count(*)::integer as count
      from analytics_events where created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(nullif(country_code,''),'XX') as country, count(distinct visitor_id)::integer as count
      from analytics_events where created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(path,'/') as path, count(*)::integer as count
      from analytics_events where event_name = 'page_view' and created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'top_projects', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(target,'unknown') as project, count(*)::integer as count
      from analytics_events where event_name = 'project_view' and created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.analytics_overview(integer) to authenticated;
