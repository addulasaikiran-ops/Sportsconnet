import "server-only";
import * as Sentry from "@sentry/nextjs";

type LogContext = Record<string, string | number | boolean | null | undefined>;

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: "sportsconnect",
    event,
    ...context
  };
  const line = JSON.stringify(record);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info(event: string, context?: LogContext) {
    write("info", event, context);
  },
  warn(event: string, context?: LogContext) {
    write("warn", event, context);
  },
  error(event: string, error?: unknown, context?: LogContext) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    write("error", event, { ...context, errorName });
    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { event, ...context }
      });
    }
  }
};
