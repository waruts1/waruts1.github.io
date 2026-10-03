/*
 * Client for the portfolio backend (contact form and visit log).
 *
 * The backend only accepts calls that carry a short-lived session token,
 * which it issues to this site's origin. The token is fetched on first use,
 * kept for the browser tab, and renewed once if the backend says it expired.
 */
(function () {
  'use strict';

  const meta = document.querySelector('meta[name="portfolio-api"]');
  const BASE = ((meta && meta.content) || 'https://smilescafe.co.ke/api/v1').replace(/\/+$/, '');
  const SESSION_KEY = 'cw_api_session';
  let pending = null;

  function cachedToken() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (saved && saved.expires > Date.now() + 60000) return saved.token;
    } catch (_) {}
    return null;
  }

  function requestToken() {
    if (!pending) {
      pending = fetch(BASE + '/portfolio/session', { method: 'POST', credentials: 'omit' })
        .then(function (response) {
          if (!response.ok) throw new Error('Session request failed: HTTP ' + response.status);
          return response.json();
        })
        .then(function (body) {
          try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
              token: body.token,
              expires: Date.now() + body.expires_in * 1000
            }));
          } catch (_) {}
          return body.token;
        })
        .finally(function () { pending = null; });
    }
    return pending;
  }

  async function send(path, body, keepalive, renew) {
    const token = (!renew && cachedToken()) || await requestToken();
    return fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(body),
      credentials: 'omit',
      keepalive: keepalive
    });
  }

  // options.keepalive lets the request outlive the page (used when the visitor leaves).
  async function post(path, body, options) {
    const keepalive = Boolean(options && options.keepalive);
    const response = await send(path, body, keepalive, false);
    return response.status === 401 ? send(path, body, keepalive, true) : response;
  }

  window.portfolioApi = { post: post };
})();
