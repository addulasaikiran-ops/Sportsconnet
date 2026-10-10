import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend(event) {
    if (event.request) {
      if (event.request.url) event.request.url = event.request.url.split("?")[0];
      delete event.request.cookies;
      delete event.request.data;
      if (event.request.headers) {
        for (const key of Object.keys(event.request.headers)) {
          if (/authorization|cookie|token|secret|api[-_]?key/i.test(key)) {
            delete event.request.headers[key];
          }
        }
      }
    }
    return event;
  }
});
