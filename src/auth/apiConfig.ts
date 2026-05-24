/** Same default as mobile `app.json` → `expo.extra.pulseApiUrl`. */
export const DEFAULT_PULSE_API_URL = "https://klaudioc.pythonanywhere.com";

/** Base URL for Pulse API (no trailing slash). */
export function getPulseApiBaseUrl(): string {
  const fromVite =
    typeof import.meta.env.VITE_PULSE_API_URL === "string"
      ? import.meta.env.VITE_PULSE_API_URL.trim()
      : "";
  const fromNext =
    typeof import.meta.env.NEXT_PUBLIC_PULSE_API_URL === "string"
      ? import.meta.env.NEXT_PUBLIC_PULSE_API_URL.trim()
      : "";
  const raw = fromVite || fromNext || DEFAULT_PULSE_API_URL;
  return raw.replace(/\/$/, "");
}

/** Default agents API host (mobile `agentsApiUrl`). */
export const DEFAULT_AGENTS_API_URL = "https://claudiok.pythonanywhere.com";

/** Base URL for agents endpoints (no trailing slash). */
export function getAgentsApiBaseUrl(): string {
  const fromVite =
    typeof import.meta.env.VITE_AGENTS_API_URL === "string"
      ? import.meta.env.VITE_AGENTS_API_URL.trim()
      : "";
  const fromNext =
    typeof import.meta.env.NEXT_PUBLIC_AGENTS_API_URL === "string"
      ? import.meta.env.NEXT_PUBLIC_AGENTS_API_URL.trim()
      : "";
  const raw = fromVite || fromNext || DEFAULT_AGENTS_API_URL;
  return raw.replace(/\/$/, "");
}

export function getGoogleWebClientId(): string | null {
  const raw =
    import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID?.trim() ||
    import.meta.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
    "";
  return raw || null;
}
