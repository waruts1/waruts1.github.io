# Private Portfolio Analytics

This implementation is designed for the portfolio hosted on GitHub Pages. GitHub Pages serves the static portfolio, while Supabase provides PostgreSQL, Auth, and the Edge Function used for analytics ingestion.

## Repository layout

The Supabase GitHub integration is configured with the repository root (`/`) as its working directory. Supabase watches the `supabase/` directory and can deploy migrations and Edge Functions from the configured production branch. citeturn0search0turn0search1

- `supabase/migrations/001_analytics.sql` — PostgreSQL tables, indexes, RLS, and the authenticated dashboard RPC.
- `supabase/functions/analytics/index.ts` — anonymous ingestion endpoint.
- `supabase/config.toml` — configures the ingestion function as a public endpoint; the function validates events and uses the service-side secret only inside Supabase.
- `analytics/bootstrap.js` — browser bootstrap that sets the ingestion endpoint, disables the legacy Telegram visitor call, and loads the tracker.
- `analytics/tracker.js` — browser event tracker.
- `analytics/config.js` — Supabase URL/publishable key for the private dashboard.
- `analytics/login.html` / `analytics/dashboard.html` — private analytics console.

## Supabase GitHub integration

Configure the Supabase GitHub integration with:

- Repository: `waruts1/waruts1.github.io`
- Working directory: `/`
- Production branch: `main`
- Keep **Deploy to production** disabled until the feature branch has been tested and is ready to merge.

Supabase's GitHub integration deploys pending migrations and Edge Functions declared in `config.toml` when production deployment is enabled for the production branch. citeturn0search0

## Setup

1. Connect the repository to the Supabase project.
2. Let the GitHub integration apply `supabase/migrations/001_analytics.sql` when the configured branch is deployed.
3. Create one private admin user in Supabase Authentication > Users. Do not enable public sign-up for the analytics account.
4. Keep the Supabase secret/service key server-side. It must never be placed in browser code or committed to GitHub. Supabase recommends publishable keys for browser code and secret keys only for trusted server-side components. citeturn3search9turn3search5
5. The `analytics` Edge Function is configured with `verify_jwt = false` because anonymous portfolio visitors must be able to send events. The function itself validates the event payload before inserting it. Supabase documents this configuration pattern for genuinely public endpoints. citeturn3search1turn3search3
6. Keep `analytics/config.js` configured with the project URL and publishable key. Never put a secret/service key in this file.
7. Add the bootstrap to `index.html` before the existing application script:

```html
<script src="./analytics/bootstrap.js" defer></script>
```

The bootstrap then loads `analytics/tracker.js` after the DOM is ready. This is the remaining portfolio-page wiring step.

## Events

The tracker automatically records:

- `page_view`
- `section_view`
- `project_view` for project-card links that expose an article/list-item heading
- `github_click`
- `cv_view`
- `cv_download`
- `outbound_click`
- `contact_submit` when the contact form is submitted

The tracker does not read or send the contact form's name, email, or message fields.

## Dashboard authentication

Use Supabase Auth `signInWithPassword` from the dedicated `/analytics/login.html` page. Do not put service-role credentials in the page. Dashboard queries use the authenticated user's JWT and the RLS-protected `analytics_overview(days)` function.

## Privacy model

The tracker intentionally does not collect names, email addresses, page contents, or raw IP addresses. A random pseudonymous visitor identifier is generated locally to provide approximate unique-visitor counts. Country is derived server-side from the edge request header when available. Visitor IDs can be reset by clearing site storage.

## GitHub-native metrics

GitHub repository traffic should be fetched separately on the server and stored in its own table if long-term history is required. GitHub's traffic endpoints are not a substitute for portfolio visitor analytics.
