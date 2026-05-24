/**
 * Response from POST create-agent (n8n webhook).
 * Ported from ../pulse/types/createAgent.ts
 */

export type CreateAgentApiResponse = {
  summary_for_user: string;
  what_will_happen: string[];
  questions: string[];
  ready_to_confirm: boolean;
  description: string;
  text: string;
  nodes: unknown;
  graph: unknown | null;
  user_goal: string;
  workflow_strategy: string;
  reasoning: string;
};

export function formatNodeLabel(node: unknown): string {
  if (typeof node === "string") return node;
  if (node && typeof node === "object" && !Array.isArray(node)) {
    const o = node as Record<string, unknown>;
    if (typeof o.name === "string" && o.name.trim()) return o.name;
    if (typeof o.type === "string" && o.type.trim()) return o.type;
  }
  try {
    const s = JSON.stringify(node);
    return s.length > 64 ? `${s.slice(0, 61)}…` : s;
  } catch {
    return "node";
  }
}

export function hasAgentNodes(nodes: unknown): boolean {
  return Array.isArray(nodes) && nodes.length > 0;
}

function unwrapResponsePayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data)) {
    const first = data[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return first as Record<string, unknown>;
    }
    return null;
  }
  return data as Record<string, unknown>;
}

function normalizeReasoningField(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (!Array.isArray(raw)) return "";
  const lines = raw.filter((x): x is string => typeof x === "string").map((s) => s.trim());
  return lines.join("\n");
}

export function normalizeCreateAgentResponse(data: unknown): CreateAgentApiResponse {
  const empty: CreateAgentApiResponse = {
    summary_for_user: "",
    what_will_happen: [],
    questions: [],
    ready_to_confirm: false,
    description: "",
    text: "",
    nodes: [],
    graph: null,
    user_goal: "",
    workflow_strategy: "",
    reasoning: "",
  };

  const o = unwrapResponsePayload(data);
  if (!o) return empty;

  const nodesRaw = o.nodes;
  let nodes: unknown = [];
  if (Array.isArray(nodesRaw)) {
    nodes = nodesRaw.slice();
  }

  const graphRaw = o.graph;
  const graph =
    graphRaw === undefined || graphRaw === null
      ? null
      : typeof graphRaw === "object" && Array.isArray(graphRaw)
        ? graphRaw.slice()
        : graphRaw;

  return {
    summary_for_user: typeof o.summary_for_user === "string" ? o.summary_for_user : "",
    what_will_happen: Array.isArray(o.what_will_happen)
      ? o.what_will_happen.filter((x): x is string => typeof x === "string")
      : [],
    questions: Array.isArray(o.questions)
      ? o.questions.filter((x): x is string => typeof x === "string")
      : [],
    ready_to_confirm: typeof o.ready_to_confirm === "boolean" ? o.ready_to_confirm : false,
    description: typeof o.description === "string" ? o.description : "",
    text: typeof o.text === "string" ? o.text : "",
    nodes,
    graph,
    user_goal: typeof o.user_goal === "string" ? o.user_goal : "",
    workflow_strategy:
      typeof o.workflow_strategy === "string" ? o.workflow_strategy : "",
    reasoning: normalizeReasoningField(o.reasoning),
  };
}

function executionIdToString(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

/** `n8n_execution_id` from confirm-agent Respond to Webhook (`$execution.id`). */
export function parseN8nExecutionIdFromConfirmWebhook(rawText: string): string | null {
  const t = rawText.trim().replace(/^\uFEFF/, "");
  if (!t) return null;
  try {
    const parsed = JSON.parse(t) as unknown;
    for (const obj of collectWebhookRecords(parsed)) {
      const id = executionIdToString(
        obj.n8n_execution_id ?? obj.n8nExecutionId,
      );
      if (id) return id;
    }
    return null;
  } catch {
    const m = t.match(/"n8n_execution_id"\s*:\s*"?([^",}\s]+)"?/i);
    return m?.[1]?.trim() || null;
  }
}

/** Collect objects from root, arrays, and common n8n wrapper keys. */
function collectWebhookRecords(parsed: unknown): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    const obj = value as Record<string, unknown>;
    records.push(obj);
    for (const key of ["body", "data", "result", "payload", "json"]) {
      if (obj[key] != null) visit(obj[key]);
    }
  };
  visit(parsed);
  return records;
}

function recordStatus(obj: Record<string, unknown>): string {
  const raw = obj.status ?? obj.Status;
  if (typeof raw === "string") return raw.trim().toLowerCase();
  return "";
}

/** create-agent webhook returned `status: "duplicate"` (spinner stays, no error). */
export function parseAgentDuplicateStatus(rawText: string): boolean {
  const t = rawText.trim().replace(/^\uFEFF/, "");
  if (!t) return false;
  if (t.toLowerCase() === "duplicate") return true;
  try {
    const parsed = JSON.parse(t) as unknown;
    if (typeof parsed === "string") {
      return parsed.trim().toLowerCase() === "duplicate";
    }
    for (const obj of collectWebhookRecords(parsed)) {
      if (recordStatus(obj) === "duplicate") return true;
    }
    return false;
  } catch {
    return /"status"\s*:\s*"duplicate"/i.test(t);
  }
}

export function buildCorrectionFromAnswers(questions: string[], answers: string[]): string {
  if (questions.length === 0) return "";
  return questions
    .map((q, i) => {
      const a = (answers[i] ?? "").trim() || "—";
      return `${i + 1}. ${q} → ${a}`;
    })
    .join("\n");
}
