/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PULSE_API_URL?: string;
  readonly VITE_GOOGLE_WEB_CLIENT_ID?: string;
  readonly NEXT_PUBLIC_PULSE_API_URL?: string;
  readonly NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
  readonly VITE_AGENTS_API_URL?: string;
  readonly NEXT_PUBLIC_AGENTS_API_URL?: string;
  readonly VITE_N8N_CREATE_AGENT_WEBHOOK_URL?: string;
  readonly VITE_N8N_CONFIRM_AGENT_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
