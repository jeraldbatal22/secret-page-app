// app/secret-page-two/error.tsx
"use client";

import { ErrorDisplay } from "@/components/error-display";
import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("Page error:", error);
    // Example: Sentry.captureException(error)
  }, [error]);

  return <ErrorDisplay error={error?.message} code="" />;
}
