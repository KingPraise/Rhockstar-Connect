/**
 * Production Error Logging Service Helper (Sentry / LogRocket ready)
 */

export function captureException(error: unknown, contextInfo?: Record<string, unknown>) {
  console.error("🔴 [PRODUCTION ERROR LOGGED]:", error);
  if (contextInfo) {
    console.error("Context:", contextInfo);
  }

  // Ready for @sentry/nextjs integration:
  // if (process.env.NODE_ENV === 'production' && window.Sentry) {
  //   Sentry.captureException(error, { extra: contextInfo });
  // }
}
