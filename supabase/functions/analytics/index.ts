// Supabase Edge Function: analytics
// Public ingestion endpoint. The service-role key must exist only in Edge Function secrets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const allowedEvents = new Set([
  'page_view', 'section_view', 'project_view', 'github_click',
  'cv_view', 'cv_download', 'contact_open', 'contact_submit', 'outbound_click'
]);

const clean = (value: unknown, max = 500): string | null => {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
};

function classifyUserAgent(ua: string) {
  const device = /tablet|ipad/i.test(ua) ? 'tablet' : /mobile|android|iphone|ipod/i.test(ua) ? 'mobile' : 'desktop';
  const browser = /edg\//i.test(ua) ? 'Edge' : /chrome\//i.test(ua) ? 'Chrome' : /firefox\//i.test(ua) ? 'Firefox' : /safari\//i.test(ua) && !/chrome|crios/i.test(ua) ? 'Safari' : /opr\//i.test(ua) ? 'Opera' : 'Other';
  const os = /windows/i.test(ua) ? 'Windows' : /mac os|macintosh/i.test(ua) ? 'macOS' : /android/i.test(ua) ? 'Android' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /linux/i.test(ua) ? 'Linux' : 'Other';
  return { device, browser, os };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const event_name = clean(body.event_name, 40);
    const visitor_id = clean(body.visitor_id, 100);
    const session_id = clean(body.session_id, 100);

    if (!event_name || !allowedEvents.has(event_name) || !visitor_id || !session_id) {
      return new Response(JSON.stringify({ error: 'Invalid event' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ua = req.headers.get('user-agent') || '';
    const { device, browser, os } = classifyUserAgent(ua);
    const country = clean(req.headers.get('cf-ipcountry'), 2)?.toUpperCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const allowedMetadata = typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : {};
    const { error } = await supabase.from('analytics_events').insert({
      visitor_id,
      session_id,
      event_name,
      path: clean(body.path, 500),
      referrer: clean(body.referrer, 1000),
      source: clean(body.source, 100),
      medium: clean(body.medium, 100),
      campaign: clean(body.campaign, 150),
      target: clean(body.target, 500),
      metadata: allowedMetadata,
      country_code: country,
      device_type: device,
      browser,
      os,
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('analytics ingestion error', error);
    return new Response(JSON.stringify({ error: 'Unable to record event' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
