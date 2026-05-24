import { getAgentsApiBaseUrl } from "../auth/apiConfig";
import { getPulseJwt } from "../auth/pulseClient";
import type { MyAgentListItem } from "../types/myAgent";

function workflowIdToString(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

export function normalizeAgentsPayload(parsed: unknown): MyAgentListItem[] {
  const root = (parsed ?? {}) as Record<string, unknown>;
  const candidates: unknown[] = [];

  if (Array.isArray(parsed)) {
    candidates.push(...parsed);
  }
  if (Array.isArray(root.agents)) {
    candidates.push(...root.agents);
  }
  if (root.data && typeof root.data === "object") {
    const dataObj = root.data as Record<string, unknown>;
    if (Array.isArray(dataObj.agents)) {
      candidates.push(...dataObj.agents);
    }
  }

  const seen = new Set<string>();
  const normalized: MyAgentListItem[] = [];
  for (const item of candidates) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const raw =
      workflowIdToString(obj.workflow_id) ||
      workflowIdToString(obj.workflowId) ||
      workflowIdToString(obj.id);
    const workflow_id = raw.trim();
    if (!workflow_id || seen.has(workflow_id)) continue;
    seen.add(workflow_id);
    normalized.push({ workflow_id });
  }
  return normalized;
}

function isLikelyCorsError(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed")
  );
}

/** Agents API fetch with Bearer token when signed in (matches mobile `agentApiFetch`). */
export async function agentsApiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getAgentsApiBaseUrl();
  const token = getPulseJwt();
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    return await fetch(url, { ...init, headers });
  } catch (e) {
    if (isLikelyCorsError(e)) {
      throw new Error(
        "Browser blocked the request (CORS). Allow Origin http://localhost:5173 on the agents API. See README.",
      );
    }
    throw e;
  }
}

export type FetchAgentsResult =
  | { ok: true; agents: MyAgentListItem[] }
  | { ok: false; code: "no_email" | "server" | "network"; message?: string };

export async function fetchMyAgents(userEmail: string): Promise<FetchAgentsResult> {
  const email = userEmail.trim().toLowerCase();
  if (!email) {
    return { ok: false, code: "no_email" };
  }

  let res: Response;
  try {
    res = await agentsApiFetch("/get-agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: email }),
    });
  } catch {
    return { ok: false, code: "network" };
  }

  const rawText = await res.text();
  let parsed: unknown = {};
  try {
    parsed = rawText.trim() ? (JSON.parse(rawText) as unknown) : {};
  } catch {
    parsed = {};
  }

  if (!res.ok) {
    const errObj = parsed as { message?: string; detail?: string };
    const detail = errObj.message || errObj.detail;
    return {
      ok: false,
      code: "server",
      message: detail ?? String(res.status),
    };
  }

  const body = parsed as { status?: string; message?: string };
  if (body.status === "error") {
    return {
      ok: false,
      code: "server",
      message: body.message,
    };
  }

  return { ok: true, agents: normalizeAgentsPayload(parsed) };
}

export type AgentActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function runAgent(workflowId: string): Promise<AgentActionResult> {
  const res = await agentsApiFetch("/run-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow_id: workflowId }),
  });

  if (!res.ok) {
    return { ok: false, message: `Request failed (${res.status}).` };
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    error?: string;
    message?: string;
  };
  if (data.status !== "success") {
    return {
      ok: false,
      message: data.message || data.error || "Backend did not confirm success.",
    };
  }
  return { ok: true };
}

export async function deleteAgent(workflowId: string): Promise<AgentActionResult> {
  const res = await agentsApiFetch("/delete-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow_id: workflowId }),
  });

  if (!res.ok) {
    return { ok: false, message: `Request failed (${res.status}).` };
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    error?: string;
    message?: string;
  };
  if (data.status !== "success") {
    return {
      ok: false,
      message: data.message || data.error || "Backend did not confirm success.",
    };
  }
  return { ok: true };
}

export function formatWorkflowDisplay(id: string): string {
  const t = id.trim();
  if (t.length <= 16) return t;
  return `${t.slice(0, 8)}…${t.slice(-6)}`;
}
