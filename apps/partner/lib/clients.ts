/**
 * Partner app API clients — same backend, Partner-specific endpoints.
 */

function getEnv(key: string, fallback: string): string {
  const val = process.env[key];
  return val && val.trim() !== "" ? val : fallback;
}

export const postgrest = {
  get url() {
    return getEnv("EXPO_PUBLIC_API_URL", "http://localhost:3000");
  },
};

export const authClient = {
  get url() {
    return getEnv("EXPO_PUBLIC_AUTH_URL", "http://localhost:5000");
  },
};

export const orchestrator = {
  get url() {
    return getEnv("EXPO_PUBLIC_ORCHESTRATOR_URL", "http://localhost:4050");
  },
};
