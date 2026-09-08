-- Harden the private analytics RPC and expose a daily trend for the dashboard.
-- The RPC remains protected by the analytics_admins allowlist.

revoke execute on function public.analytics_overview(integer) from public;
grant execute on function public.analytics_overview(integer) to authenticated;

create or replace function public.analytics_overview(days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since_at timestamptz := now() - make_interval(days => greatest(days, 1));
  result jsonb;
begin
  if not exists (
    select 1
    from public.analytics_admins
    where user_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'visitors', (select count(distinct visitor_id) from public.analytics_events where created_at >= since_at),
    'page_views', (select count(*) from public.analytics_events where event_name = 'page_view' and created_at >= since_at),
    'github_clicks', (select count(*) from public.analytics_events where event_name = 'github_click' and created_at >= since_at),
    'contact_submits', (select count(*) from public.analytics_events where event_name = 'contact_submit' and created_at >= since_at),
    'cv_views', (select count(*) from public.analytics_events where event_name in ('cv_view','cv_download') and created_at >= since_at),
    'project_visitors', (select count(distinct visitor_id) from public.analytics_events where event_name = 'project_view' and created_at >= since_at),
    'sources', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(nullif(source,''),'direct') as source, count(*)::integer as count
      from public.analytics_events where created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(nullif(country_code,''),'XX') as country, count(distinct visitor_id)::integer as count
      from public.analytics_events where created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(path,'/') as path, count(*)::integer as count
      from public.analytics_events where event_name = 'page_view' and created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'top_projects', coalesce((select jsonb_agg(x order by x.count desc) from (
      select coalesce(target,'unknown') as project, count(*)::integer as count
      from public.analytics_events where event_name = 'project_view' and created_at >= since_at group by 1 limit 10
    ) x), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(x order by x.day asc) from (
      select
        to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
        count(distinct visitor_id)::integer as visitors,
        count(*) filter (where event_name = 'page_view')::integer as page_views,
        count(*) filter (where event_name = 'github_click')::integer as github_clicks,
        count(*) filter (where event_name in ('cv_view','cv_download'))::integer as cv_views,
        count(*) filter (where event_name = 'contact_submit')::integer as contact_submits
      from public.analytics_events
      where created_at >= since_at
      group by 1
    ) x), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

grant execute on function public.analytics_overview(integer) to authenticated;
