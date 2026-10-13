/**
 * Environment Variable Validation for Rhockstar Connect
 * Validates critical Firebase and API environment variables at runtime.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn(`⚠️ [ENV WARNING] Missing production environment variables: ${missing.join(', ')}`);
  }

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}
