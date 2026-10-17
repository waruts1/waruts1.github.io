(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const url = window.HOTSPOT_SUPABASE_URL, key = window.HOTSPOT_SUPABASE_ANON_KEY;
  if (!window.supabase || !url || !key || url.includes('YOUR_PROJECT') || key.includes('YOUR_SUPABASE')) { $('login-status').textContent = 'Setup required: configure Supabase URL and publishable/anon key in supabase-config.js.'; return; }
  const client = window.supabase.createClient(url, key, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  async function admin() {
    const result = await client.auth.getSession(), session = result.data.session;
    if (!session) { $('login-panel').classList.remove('hidden'); $('dashboard').classList.add('hidden'); $('logout').classList.add('hidden'); return; }
    if (!session.user.app_metadata || session.user.app_metadata.role !== 'admin') { $('login-status').textContent = 'This account does not have the server-assigned admin role.'; await client.auth.signOut(); return; }
    $('login-panel').classList.add('hidden'); $('dashboard').classList.remove('hidden'); $('logout').classList.remove('hidden'); await refresh();
  }
  $('login-form').addEventListener('submit', async e => { e.preventDefault(); $('login-status').textContent = 'Signing in…'; const r = await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value}); if (r.error) { $('login-status').textContent = r.error.message; return; } await admin(); });
  $('logout').addEventListener('click', async () => { await client.auth.signOut(); await admin(); });
  $('refresh').addEventListener('click', refresh);
  async function refresh() {
    $('data-status').textContent = 'Loading dashboard data…';
    const results = await Promise.all([client.from('hotspot_sessions').select('phone_e164,device_mac,plan_id,status,expires_at,created_at').order('created_at',{ascending:false}).limit(100),client.from('hotspot_payments').select('receipt_code,phone_e164,amount_kes,status,created_at').order('created_at',{ascending:false}).limit(100)]);
    const sessions=results[0], payments=results[1];
    if (sessions.error || payments.error) { $('data-status').textContent = 'Could not load data. Check the Supabase schema, RLS policies, and admin role.'; return; }
    const active=sessions.data.filter(s=>s.status==='active'&&s.expires_at&&Date.parse(s.expires_at)>Date.now()).length, confirmed=payments.data.filter(p=>p.status==='confirmed');
    $('active-count').textContent=active; $('payment-count').textContent=confirmed.length; $('revenue').textContent=confirmed.reduce((sum,p)=>sum+Number(p.amount_kes||0),0).toLocaleString('en-KE');
    $('sessions-body').innerHTML=sessions.data.length?sessions.data.map(s=>'<tr><td>'+esc(s.phone_e164)+'</td><td>'+esc(s.device_mac||'Not recorded')+'</td><td>'+esc(s.plan_id)+'</td><td>'+esc(s.status)+'</td><td>'+(s.expires_at?new Date(s.expires_at).toLocaleString():'—')+'</td></tr>').join(''):'<tr><td colspan="5">No sessions yet.</td></tr>';
    $('payments-body').innerHTML=payments.data.length?payments.data.map(p=>'<tr><td>'+esc(p.receipt_code)+'</td><td>'+esc(p.phone_e164)+'</td><td>KES '+Number(p.amount_kes).toLocaleString('en-KE')+'</td><td>'+esc(p.status)+'</td><td>'+new Date(p.created_at).toLocaleString()+'</td></tr>').join(''):'<tr><td colspan="5">No payments yet.</td></tr>';
    $('data-status').textContent='Updated '+new Date().toLocaleTimeString();
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  client.auth.onAuthStateChange(() => { admin(); }); admin();
})();