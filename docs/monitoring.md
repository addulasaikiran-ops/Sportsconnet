# SportsConnect monitoring and alert setup

This repository includes a scheduled GitHub Actions health monitor. It checks the deployed app's `/api/health` endpoint and Supabase REST API every 15 minutes, flags either check taking more than 2 seconds, and emails on the first failure and again when service recovers. An Upstash incident key suppresses repeated emails during an ongoing incident. The monitor workflow runs on the default branch only; merge this PR and deploy the app before expecting meaningful production checks.

## GitHub Actions secrets required

Add these under **Repository → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Purpose |
|---|---|
| `SPORTSCONNECT_BASE_URL` | Deployed app origin, e.g. `https://your-domain.example` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | SportsConnect Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key; never use a service-role key |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL, also used by API rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token, also used by API rate limiting |
| `ALERT_SMTP_SERVER` | SMTP host from your email provider |
| `ALERT_SMTP_PORT` | SMTP port (commonly 465 for implicit TLS or 587 for STARTTLS) |
| `ALERT_SMTP_USERNAME` | SMTP account/user |
| `ALERT_SMTP_PASSWORD` | SMTP password or provider-generated app password |
| `ALERT_EMAIL_FROM` | Verified sender address allowed by the SMTP provider |
| `ALERT_EMAIL_TO` | Recipient address for alerts and recovery messages |

Use a provider that supports authenticated SMTP, such as your organization's mail provider or a transactional email service. Do not commit SMTP credentials to the repository. The workflow uses a third-party GitHub Action to deliver email; review its repository and pin it to a reviewed commit SHA if your security policy requires immutable action references.

## What this monitor covers

- App health endpoint availability and response time (2-second initial threshold).
- Supabase REST API availability and response time (2-second initial threshold).
- Email notification when an incident first opens and when checks recover.
- Repeated-alert suppression using an Upstash key with a seven-day TTL.

This is an external availability check, not a full database query/transaction test. It does not measure API-wide p95 latency, inspect 5xx/429 rates across all routes, or detect failed login bursts. Tune thresholds after observing real traffic.

## Sentry: error, performance, and security alerts

Sentry DSN configuration enables event collection, but alert rules must still be created in the Sentry project UI. Suggested initial rules:

1. **New high-impact issue:** notify the email destination when a new issue is first seen.
2. **Error-rate spike:** alert when server errors rise above baseline for several minutes, with a minimum event count to avoid noise.
3. **Latency regression:** if performance monitoring is enabled for the project, alert on sustained high transaction latency.
4. **Security/abuse signal:** alert on repeated authentication failures or sustained 429 responses only after adding safe, aggregate events/metrics for those signals. Never send passwords, tokens, cookies, message bodies, or raw request payloads to Sentry.

Use the Sentry project's alert notification settings to route these alerts to the same email recipient. Availability checks in this workflow do not replace Sentry issue/performance alerts.

## Supabase and hosting dashboards

- In the Supabase dashboard for SportsConnect, review database/API logs, resource usage, connection pressure, and available project alert options. Configure email notifications supported by your plan.
- In your hosting dashboard, configure deployment/build failure notifications and watch function duration, 5xx rates, and runtime logs.
- Keep application logs free of credentials and personal message contents.

## Activation checklist

- [ ] Merge the monitoring PR.
- [ ] Deploy the app when you are ready; deployment is intentionally not part of this change.
- [ ] Add all GitHub Actions secrets above.
- [ ] Run **Actions → SportsConnect Monitoring → Run workflow** to test the first check and email delivery.
- [ ] Create Sentry issue/performance alert rules and Supabase/hosting notifications in their dashboards.
- [ ] Test an incident and recovery email with a controlled test environment before relying on production alerts.

Until the workflow is merged, the app is deployed, and all secrets are set, email monitoring is not active.
