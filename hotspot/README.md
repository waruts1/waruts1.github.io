# Paid Wi-Fi Hotspot — MVP frontend

This folder is an isolated, unmerged GitHub Pages feature branch. It does not replace the existing portfolio homepage.

## Current UI

- Mobile-first captive portal layout.
- Hourly plan cards (KES 10 / 1 hour, KES 25 / 3 hours, KES 40 / 6 hours) as editable starter prices.
- 1 Mbps download and upload per device.
- M-Pesa Paybill transaction-code form.
- Secure-backend API integration point: `POST /hotspot/payments/verify`.
- Countdown appears only when the API returns a server-confirmed active session and expiry timestamp.

**The sample prices are placeholders. Confirm your real pricing before enabling sales.** The page intentionally does not grant internet access locally and does not claim a payment succeeded when the API is not configured.

## Architecture

- Frontend: GitHub Pages, static files in this directory.
- Admin/data: Supabase Auth + Postgres; use the SQL in `supabase/schema.sql`.
- Backend: existing Flask app in `waruts1/flask_realtime_payments_callback`, extended only in a separate branch. Never put Supabase service-role keys, Daraja credentials, SMS keys, or router credentials in browser JavaScript.
- Payments: use a dedicated hotspot payment reference and reconcile M-Pesa confirmation records server-side. A customer-supplied receipt code is a lookup key, not proof of payment.
- Provisioning: adapter depends on the exact TP-Link model and whether it is Omada-managed. Do not authorize a device until the payment, amount, plan, and unused transaction receipt have been checked and recorded atomically.

## Local preview

Open `index.html` in a browser. Without `window.HOTSPOT_API_BASE`, the verification form stays safely in setup mode.

For a deployed test environment, configure `window.HOTSPOT_API_BASE` in a separate `config.js` file loaded before `app.js`; do not commit secrets. Enable GitHub Pages only after reviewing this branch and confirming the hosting path.

## Before production

1. Confirm the actual Paybill shortcode and payment records available in the Flask integration.
2. Confirm TP-Link model and management mode (Omada controller, standalone router, or ISP-supplied device).
3. Add server-side API authentication, rate limiting, receipt idempotency, and audit logs.
4. Configure Supabase RLS and create the initial admin user manually.
5. Choose an SMS provider and configure credentials as backend environment variables.
6. Test expiry, router disconnect, duplicate receipts, delayed callbacks, and router/API outages in a lab.
