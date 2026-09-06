/*
 * Portfolio analytics client.
 *
 * Configure PORTFOLIO_ANALYTICS_ENDPOINT with the deployed Supabase Edge Function URL.
 * The tracker deliberately sends no name, email, raw IP address, or page contents.
 */
(function () {
  'use strict';

  const ENDPOINT = window.PORTFOLIO_ANALYTICS_ENDPOINT || '';
  if (!ENDPOINT) return;

  const VISITOR_KEY = 'cw_analytics_visitor_id';
  const SESSION_KEY = 'cw_analytics_session_id';
  const SESSION_TTL = 30 * 60 * 1000;

  function id() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getVisitorId() {
    let value = localStorage.getItem(VISITOR_KEY);
    if (!value) {
      value = id();
      localStorage.setItem(VISITOR_KEY, value);
    }
    return value;
  }

  function getSessionId() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.createdAt < SESSION_TTL) return parsed.id;
      }
      const value = { id: id(), createdAt: Date.now() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
      return value.id;
    } catch (_) {
      return id();
    }
  }

  function sourceFromUrl() {
    const params = new URLSearchParams(location.search);
    const utmSource = params.get('utm_source');
    const ref = document.referrer;
    if (utmSource) return utmSource;
    if (!ref) return 'direct';
    try {
      const host = new URL(ref).hostname.toLowerCase();
      if (host.includes('github.com')) return 'github';
      if (host.includes('linkedin.com')) return 'linkedin';
      if (host.includes('google.')) return 'google';
      if (host.includes('bing.com')) return 'bing';
      return host.replace(/^www\\./, '');
    } catch (_) {
      return 'referral';
    }
  }

  function send(eventName, data) {
    const params = new URLSearchParams(location.search);
    const body = JSON.stringify({
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      event_name: eventName,
      path: location.pathname,
      referrer: document.referrer || null,
      source: sourceFromUrl(),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      ...data
    });

    // Use a CORS-safelisted content type. This avoids a browser preflight,
    // which is important for anonymous analytics from GitHub Pages.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      keepalive: true,
      credentials: 'omit'
    }).catch(function (error) {
      console.debug('Portfolio analytics request failed', error);
    });
  }

  window.portfolioAnalytics = { track: send };

  send('page_view');

  const seen = new Set();
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen.has(entry.target.id)) {
          seen.add(entry.target.id);
          send('section_view', { target: entry.target.id });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    const host = url.hostname.toLowerCase();
    const isGitHub = host === 'github.com' || host.endsWith('.github.com');
    const isCv = /\\.(pdf)$/i.test(url.pathname) || /\\b(cv|resume)\\b/i.test(url.pathname + ' ' + (link.textContent || ''));
    const target = link.dataset.analyticsTarget || link.getAttribute('aria-label') || link.textContent.trim().slice(0, 120);

    if (isGitHub) {
      send('github_click', { target: url.pathname });
    } else if (isCv) {
      send(/download/i.test(link.textContent || '') ? 'cv_download' : 'cv_view', { target: url.pathname });
    } else if (url.origin !== location.origin) {
      send('outbound_click', { target: url.origin });
    }

    if (link.closest('#projects')) {
      const card = link.closest('article, [role="listitem"]');
      const heading = card && card.querySelector('h3, h4');
      const project = heading && heading.textContent.trim();
      if (project) send('project_view', { target: project.slice(0, 160) });
    }
  }, { passive: true });

  const contactForm = document.querySelector('#contact form');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      send('contact_submit');
    }, { passive: true });
  }
})();
