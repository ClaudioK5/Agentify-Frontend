import { getN8nCreateAgentWebhookUrl } from "../auth/n8nConfig";

const CREATE_AGENT_FETCH_TIMEOUT_MS = 60 * 60 * 1000;

export type CreateAgentWebhookPayload = {
  description: string;
  user_id: string;
  pulseToken?: string | null;
  /** Reuse on idempotent status checks so n8n does not start a new run. */
  execution_id?: string;
};

export async function postCreateAgentWebhook(
  payload: CreateAgentWebhookPayload,
): Promise<Response> {
  const url = getN8nCreateAgentWebhookUrl();
  if (!url) {
    throw new Error(
      "N8N create-agent webhook URL is not configured. Set VITE_N8N_CREATE_AGENT_WEBHOOK_URL.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (payload.pulseToken) {
    headers.Authorization = `Bearer ${payload.pulseToken}`;
  }

  const execution_id = payload.execution_id?.trim() || crypto.randomUUID();
  const body = {
    execution_id,
    description: payload.description.trim(),
    user_id: payload.user_id,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CREATE_AGENT_FETCH_TIMEOUT_MS);

  if (import.meta.env.DEV) {
    console.log("[Agentify] POST create-agent", {
      execution_id,
      user_id: body.user_id,
      descriptionLen: body.description.length,
    });
  }

  try {
    return await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
