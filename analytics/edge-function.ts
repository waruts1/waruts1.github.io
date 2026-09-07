import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const allowedEvents = new Set([
  'page_view',
  'section_view',
  'project_view',
  'github_click',
  'cv_view',
  'cv_download',
  'contact_open',
  'contact_submit',
  'outbound_click',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();

    if (!payload?.event_name || !allowedEvents.has(payload.event_name)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid event_name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!payload?.visitor_id || !payload?.session_id) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing visitor/session id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const userAgent = req.headers.get('user-agent');
    const country = req.headers.get('cf-ipcountry');

    const { error } = await supabase.from('analytics_events').insert({
      event_name: payload.event_name,
      visitor_id: payload.visitor_id,
      session_id: payload.session_id,
      path: payload.path || null,
      referrer: payload.referrer || null,
      source: payload.source || null,
      medium: payload.medium || null,
      campaign: payload.campaign || null,
      target: payload.target || null,
      country: country || null,
      user_agent: userAgent || null,
    });

    if (error) {
      console.error('analytics_events insert failed', error);
      return new Response(JSON.stringify({ ok: false, error: 'Insert failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('analytics function failed', error);
    return new Response(JSON.stringify({ ok: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
