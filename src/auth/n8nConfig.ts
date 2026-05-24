export function getN8nCreateAgentWebhookUrl(): string | null {
  const url = import.meta.env.VITE_N8N_CREATE_AGENT_WEBHOOK_URL?.trim() ?? "";
  if (!url) return null;
  if (import.meta.env.DEV) {
    try {
      const u = new URL(url);
      console.log("[Agentify] n8n create-agent webhook:", `${u.origin}${u.pathname}`);
    } catch {
      console.warn("[Agentify] n8n create-agent webhook URL is not valid:", url);
    }
  }
  return url;
}

export function getN8nConfirmAgentWebhookUrl(): string | null {
  const url = import.meta.env.VITE_N8N_CONFIRM_AGENT_WEBHOOK_URL?.trim() ?? "";
  if (!url) return null;
  if (import.meta.env.DEV) {
    try {
      const u = new URL(url);
      console.log("[Agentify] n8n confirm-agent webhook:", `${u.origin}${u.pathname}`);
    } catch {
      console.warn("[Agentify] n8n confirm-agent webhook URL is not valid:", url);
    }
  }
  return url;
}
