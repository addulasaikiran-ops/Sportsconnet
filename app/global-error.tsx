"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ margin: "4rem auto", maxWidth: 560, padding: "0 1.5rem", fontFamily: "system-ui, sans-serif" }}>
          <h2>Something went wrong</h2>
          <p>We couldn’t load this part of SportsConnect. Please try again.</p>
          {error.digest ? <p>Reference: {error.digest}</p> : null}
          <button onClick={() => reset()}>Try again</button>
        </main>
      </body>
    </html>
  );
}
