/*
 * Portfolio visit tracker.
 *
 * Reports each visit to the portfolio API, which turns it into one Telegram
 * message that fills in live: the page reports again as it is scrolled (scroll
 * depth, time per section, links clicked) and once more when the visitor leaves.
 *
 * Tag links you hand out to see who opened them:  https://waruts1.github.io/?ref=acme-hr
 * Stop counting your own visits on a device:      open the site once with ?notrack=1
 * (?notrack=0 turns tracking back on).
 */
(function () {
  'use strict';

  // Session-token client shared with the contact form (portfolio.api.js)
  const api = window.portfolioApi;
  if (!api) return;

  const VISITOR_KEY = 'cw_analytics_visitor_id';
  const SESSION_KEY = 'cw_analytics_session_id';
  const VISIT_KEY = 'cw_portfolio_visit';
  const OPT_OUT_KEY = 'cw_notrack';
  const SESSION_TTL = 30 * 60 * 1000;

  const MIN_GAP = 4000;       // at most one report every 4s while scrolling
  const HEARTBEAT = 15000;    // time-on-page refresh while nothing else changes
  const MAX_REPORTS = 80;     // per page load
  const SCROLL_STEP = 10;     // report every 10% of new scroll depth

  const store = {
    get(area, key) { try { return area.getItem(key); } catch (_) { return null; } },
    set(area, key, value) { try { area.setItem(key, value); } catch (_) { /* storage blocked */ } },
    remove(area, key) { try { area.removeItem(key); } catch (_) { /* storage blocked */ } }
  };
  const readJson = (area, key) => {
    try { return JSON.parse(store.get(area, key)) || null; } catch (_) { return null; }
  };

  const params = new URLSearchParams(location.search);
  if (params.get('notrack') === '1') store.set(localStorage, OPT_OUT_KEY, '1');
  if (params.get('notrack') === '0') store.remove(localStorage, OPT_OUT_KEY);
  const optedOut = store.get(localStorage, OPT_OUT_KEY) === '1' || navigator.webdriver === true;

  function id() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getVisitorId() {
    let value = store.get(localStorage, VISITOR_KEY) || store.get(localStorage, 'visitorId');
    if (!value) value = id();
    store.set(localStorage, VISITOR_KEY, value);
    store.set(localStorage, 'visitorId', value);
    return value;
  }

  function getSessionId() {
    const saved = readJson(sessionStorage, SESSION_KEY);
    if (saved && saved.id && Date.now() - saved.createdAt < SESSION_TTL) return saved.id;
    const value = { id: id(), createdAt: Date.now() };
    store.set(sessionStorage, SESSION_KEY, JSON.stringify(value));
    return value.id;
  }

  function sourceFromUrl() {
    const utmSource = params.get('utm_source');
    const ref = document.referrer;
    if (utmSource) return utmSource;
    if (!ref) return 'direct';
    try {
      const host = new URL(ref).hostname.toLowerCase();
      if (host === location.hostname) return 'direct';
      if (host.includes('github.com')) return 'github';
      if (host.includes('linkedin.com') || host === 'lnkd.in') return 'linkedin';
      if (host.includes('google.')) return 'google';
      if (host.includes('bing.com')) return 'bing';
      return host.replace(/^www\./, '');
    } catch (_) {
      return 'referral';
    }
  }

  // Any failure switches reporting off for the rest of the page view, quietly:
  // a visitor's console should never fill with tracker errors.

  let stopped = false;

  function stop(reason) {
    stopped = true;
    console.debug('Portfolio tracker paused:', reason);
  }

  // ---------- What the visitor does ----------

  const sessionId = getSessionId();
  const saved = readJson(sessionStorage, VISIT_KEY);
  const resumed = saved && saved.sessionId === sessionId ? saved : {};

  const state = {
    token: resumed.token || null,       // names this visit's Telegram message
    scroll: resumed.scroll || 0,        // deepest point reached, %
    duration: resumed.duration || 0,    // seconds with the page visible
    sections: resumed.sections || {},   // seconds spent in each section
    actions: resumed.actions || []      // links clicked, form sent
  };

  let dirty = false;
  let sending = false;
  let reports = 0;
  let lastSent = 0;
  let lastSentDuration = -1;
  let reportedScroll = state.scroll;
  let timer = null;

  function remember() {
    store.set(sessionStorage, VISIT_KEY, JSON.stringify({
      sessionId: sessionId, token: state.token, scroll: state.scroll,
      duration: state.duration, sections: state.sections, actions: state.actions
    }));
  }

  function payload(final) {
    return {
      visitorId: getVisitorId(),
      sessionId: sessionId,
      url: location.href,
      pageTitle: document.title,
      referrer: document.referrer || null,
      source: sourceFromUrl(),
      ref: params.get('ref') || params.get('r') || null,
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      scroll: state.scroll,
      duration: state.duration,
      sections: state.sections,
      actions: state.actions,
      final: final,
      token: state.token
    };
  }

  function report(final) {
    if (stopped || optedOut) return;
    if (sending) { dirty = true; return; }
    if (reports >= MAX_REPORTS && !final) return;

    sending = true;
    dirty = false;
    reports += 1;
    lastSent = Date.now();
    lastSentDuration = state.duration;
    reportedScroll = state.scroll;

    api.post('/telegram', payload(final), { keepalive: final })
      .then(function (response) {
        if (!response.ok) { stop('HTTP ' + response.status); return null; }
        return response.json();
      })
      .then(function (body) {
        if (body && body.token) { state.token = body.token; remember(); }
        if (body && body.status === 'ignored') stop('ignored by server');
      })
      .catch(function (error) { stop(error && error.message); })
      .finally(function () {
        sending = false;
        if (dirty) schedule();
      });
  }

  function schedule() {
    if (stopped || optedOut) return;
    dirty = true;
    if (timer) return;
    const wait = Math.max(0, MIN_GAP - (Date.now() - lastSent));
    timer = setTimeout(function () {
      timer = null;
      if (dirty) report(false);
    }, wait);
  }

  function action(name) {
    const value = String(name || '').slice(0, 80);
    if (!value || state.actions.includes(value) || state.actions.length >= 20) return;
    state.actions.push(value);
    remember();
    schedule();
  }

  const areas = Array.prototype.slice.call(document.querySelectorAll('header[id], main section[id]'));

  function currentSection() {
    const middle = window.innerHeight / 2;
    for (let i = 0; i < areas.length; i += 1) {
      const box = areas[i].getBoundingClientRect();
      if (box.top <= middle && box.bottom > middle) return areas[i].id;
    }
    return null;
  }

  function measureScroll() {
    // Until the profile has rendered the page is short and would read as "100%"
    const height = document.documentElement.scrollHeight;
    if (document.readyState !== 'complete' || height <= window.innerHeight) return;
    const reached = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / height) * 100));
    if (reached > state.scroll) state.scroll = reached;
    if (state.scroll - reportedScroll >= SCROLL_STEP || (state.scroll === 100 && reportedScroll < 100)) schedule();
  }

  function tick() {
    if (document.visibilityState !== 'visible') return;
    state.duration += 1;
    const section = currentSection();
    if (section) {
      if (!state.sections[section]) schedule();   // a section seen for the first time
      state.sections[section] = (state.sections[section] || 0) + 1;
    }
    measureScroll();
    if (state.duration % 5 === 0) remember();
    if (state.duration !== lastSentDuration && Date.now() - lastSent >= HEARTBEAT) schedule();
  }

  function leaving() {
    if (stopped || optedOut || !state.token) return;
    remember();
    if (timer) { clearTimeout(timer); timer = null; }
    sending = false;
    report(true);
  }

  window.portfolioTracker = { action: action };

  if (optedOut) return;

  report(false);
  setInterval(tick, 1000);

  let scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () { scrollQueued = false; measureScroll(); });
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') leaving();
    else schedule();
  });
  window.addEventListener('pagehide', leaving);

  document.addEventListener('click', function (event) {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    const host = url.hostname.toLowerCase();
    const text = (link.textContent || '').trim();

    if (link.closest('#projects')) {
      const card = link.closest('article, [role="listitem"]');
      const heading = card && card.querySelector('h3, h4');
      if (heading) action('project:' + heading.textContent.trim().slice(0, 60));
    }

    if (host === 'github.com' || host.endsWith('.github.com')) action('github:' + url.pathname);
    else if (host.endsWith('linkedin.com')) action('linkedin');
    else if (/\.pdf$/i.test(url.pathname) || /\b(cv|resume)\b/i.test(url.pathname + ' ' + text)) action('cv');
    else if (url.origin !== location.origin) action('outbound:' + host);
  }, { passive: true });

  const contactForm = document.querySelector('#contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', function () { action('contact_submit'); }, { passive: true });
  }
})();
