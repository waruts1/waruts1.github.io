# Private Portfolio Analytics

This implementation is designed for the portfolio hosted on GitHub Pages. GitHub Pages cannot run a private API, so the analytics backend uses Supabase PostgreSQL + Auth + an Edge Function.

## Repository layout

The Supabase GitHub integration is configured with the repository root (`/`) as its working directory. The deployable Supabase assets live under:

- `supabase/migrations/001_analytics.sql` — PostgreSQL tables, indexes, RLS, and the authenticated dashboard RPC.
- `supabase/functions/analytics/index.ts` — anonymous ingestion endpoint.
- `supabase/config.toml` — configures the ingestion function as a public endpoint; the function validates events and uses the service role only server-side.

The `analytics/` directory contains the browser tracker, private login/dashboard, public browser configuration, and setup documentation.

## Supabase GitHub integration

Configure the Supabase GitHub integration with:

- Repository: `waruts1/waruts1.github.io`
- Working directory: `/`
- Production branch: `main`
- Keep production deployment disabled until the feature branch has been tested and is ready to merge.

## Setup

1. Connect the repository to the Supabase project.
2. Apply the migration in `supabase/migrations/001_analytics.sql`.
3. Create one private admin user in Supabase Authentication > Users. Do not enable public sign-up for the analytics account.
4. Configure the Edge Function secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never put the service-role key in browser code or GitHub.
5. Deploy the `analytics` Edge Function from `supabase/functions/analytics/`.
6. The browser endpoint is `https://<project-ref>.supabase.co/functions/v1/analytics`.
7. Configure `analytics/config.js` with the Supabase project URL and publishable key. Never put a secret/service-role key in this file.
8. Load `analytics/tracker.js` from the portfolio page with `window.PORTFOLIO_ANALYTICS_ENDPOINT` set to the deployed function URL.

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

Use Supabase Auth `signInWithPassword` from the dedicated `/analytics/login.html` page. Do not put service-role credentials in the page. Dashboard queries use the authenticated user's JWT and the RLS-protected `analytics_overview(days)` function.

## Privacy model

The tracker intentionally does not collect names, email addresses, page contents, or raw IP addresses. A random pseudonymous visitor identifier is generated locally to provide approximate unique-visitor counts. Country is derived server-side from the edge request header when available. Visitor IDs can be reset by clearing site storage.

## GitHub-native metrics

GitHub repository traffic should be fetched separately on the server and stored in its own table if long-term history is required. GitHub's traffic endpoints are not a substitute for portfolio visitor analytics.
