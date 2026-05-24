import { getPulseApiBaseUrl } from "./apiConfig";

export class CancelSubscriptionError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CancelSubscriptionError";
    this.status = status;
  }
}

/** POST /cancel-subscription — cancels Stripe subscription via backend. */
export async function cancelSubscription(pulseToken: string): Promise<void> {
  const token = pulseToken.trim();
  if (!token) {
    throw new CancelSubscriptionError("Not signed in");
  }

  const base = getPulseApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let res: Response;
  try {
    res = await fetch(`${base}/cancel-subscription`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      throw new CancelSubscriptionError("Request timed out. Please try again.");
    }
    throw new CancelSubscriptionError(
      e instanceof Error ? e.message : "Could not reach the server",
    );
  }
  clearTimeout(timeout);

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      (typeof data.detail === "string" && data.detail) ||
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      `Could not cancel subscription (${res.status})`;
    throw new CancelSubscriptionError(msg, res.status);
  }

  if (import.meta.env.DEV) {
    console.log("[Pulse] POST /cancel-subscription OK");
  }
}
