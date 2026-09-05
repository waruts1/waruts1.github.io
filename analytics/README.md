# Private Portfolio Analytics

This implementation is designed for the portfolio hosted on GitHub Pages. GitHub Pages cannot run a private API, so the analytics backend uses Supabase PostgreSQL + Auth + an Edge Function.

## Components

- `schema.sql` — PostgreSQL tables, indexes, RLS, and the authenticated dashboard RPC.
- `tracker.js` — lightweight browser tracker. It stores a random visitor ID in local storage and a short-lived session ID in session storage.
- `edge-function.ts` — anonymous ingestion endpoint. It uses the Supabase service role only on the server side and never exposes that key to the browser.
- `dashboard.html` — reserved for the private dashboard UI once the Supabase project is connected.

## Setup

1. Create a Supabase project.
2. Run `schema.sql` in the Supabase SQL editor.
3. Create one admin user in Supabase Authentication > Users. Do not enable public sign-up for the analytics account.
4. Deploy `edge-function.ts` as an Edge Function named `analytics`.
5. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as Edge Function secrets.
6. The browser endpoint will be `https://<project-ref>.supabase.co/functions/v1/analytics`.
7. Add this before the portfolio's closing `</body>` tag:

```html
<script>
  window.PORTFOLIO_ANALYTICS_ENDPOINT = 'https://<project-ref>.supabase.co/functions/v1/analytics';
</script>
<script src="./analytics/tracker.js" defer></script>
```

## Contact-form event

After a successful contact API response, call:

```js
window.portfolioAnalytics?.track('contact_submit');
```

For a contact form opening event, call `contact_open`.

## Project event

When a project card/detail view is opened:

```js
window.portfolioAnalytics?.track('project_view', { target: project.slug });
```

## Dashboard authentication

Use Supabase Auth `signInWithPassword` from a dedicated `/analytics/` page. Do not put service-role credentials in the page. Dashboard queries use the authenticated user's JWT and the RLS-protected `analytics_overview(days)` function.

## Privacy model

The tracker intentionally does not collect names, email addresses, page contents, or raw IP addresses. A random visitor identifier is generated locally to provide approximate unique-visitor counts. Country is derived server-side from the edge request header when available. Visitor IDs can be reset by clearing site storage.

## GitHub-native metrics

GitHub repository traffic should be fetched separately on the server and stored in its own table if long-term history is required. GitHub's traffic endpoints are not a substitute for portfolio visitor analytics.
