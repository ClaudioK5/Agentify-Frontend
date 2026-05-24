import { getN8nConfirmAgentWebhookUrl } from "../auth/n8nConfig";

const CONFIRM_FETCH_TIMEOUT_MS = 60 * 60 * 1000;

export type ConfirmAgentHttpResult = {
  response: Response;
  rawText: string;
};

export type ConfirmAgentWebhookPayload = {
  /** Reuse on idempotent status checks so n8n does not start a new run. */
  execution_id?: string;
  correction: string;
  user_email: string;
  user_id: string;
  description: string;
  text: string;
  summary_for_user: string;
  what_will_happen: string[];
  notes: unknown;
  graph: unknown | null;
  user_goal: string;
  workflow_strategy: string;
  reasoning: string;
  pulseToken?: string | null;
};

/** POST confirm-agent; response includes `n8n_execution_id` for GET /get-execution_id polling. */
export async function postConfirmAgentWebhook(
  payload: ConfirmAgentWebhookPayload,
): Promise<ConfirmAgentHttpResult> {
  const url = getN8nConfirmAgentWebhookUrl();
  if (!url) {
    throw new Error(
      "N8N confirm-agent webhook URL is not configured. Set VITE_N8N_CONFIRM_AGENT_WEBHOOK_URL.",
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
    correction: payload.correction.trim(),
    user_email: payload.user_email.trim(),
    user_id: payload.user_id,
    description: payload.description,
    text: payload.text,
    summary_for_user: payload.summary_for_user,
    what_will_happen: payload.what_will_happen,
    notes: payload.notes,
    graph: payload.graph,
    user_goal: payload.user_goal,
    workflow_strategy: payload.workflow_strategy,
    reasoning: payload.reasoning,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIRM_FETCH_TIMEOUT_MS);

  if (import.meta.env.DEV) {
    console.log("[Agentify] POST confirm-agent", {
      execution_id,
      user_id: body.user_id,
      correctionLen: body.correction.length,
      hasUserEmail: body.user_email.length > 0,
    });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const rawText = await response.text();
    return { response, rawText };
  } finally {
    clearTimeout(timeout);
  }
}
