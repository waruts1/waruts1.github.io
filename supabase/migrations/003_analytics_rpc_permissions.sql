-- Restrict direct execution of the private analytics RPC to authenticated users.
-- The function still performs its own analytics_admins allowlist check.

revoke execute on function public.analytics_overview(integer) from public;
grant execute on function public.analytics_overview(integer) to authenticated;
