import { agentsApiFetch } from "../api/agentsApi";

export const POLL_INTERVAL_MS = 5000;

export type ExecutionPollState = {
  finished: boolean;
  execution_status: string;
};

function parseExecutionPollState(parsed: unknown): ExecutionPollState | null {
  if (!parsed || typeof parsed !== "object") return null;
  const root = parsed as Record<string, unknown>;
  if (root.status === "error") return null;

  const finishedRaw = root.finished;
  if (
    typeof finishedRaw !== "boolean" &&
    finishedRaw !== "true" &&
    finishedRaw !== "false" &&
    finishedRaw !== 1 &&
    finishedRaw !== 0
  ) {
    return null;
  }

  const finished =
    finishedRaw === true || finishedRaw === "true" || finishedRaw === 1;

  const statusRaw = root.execution_status ?? root.executionStatus;
  const execution_status =
    typeof statusRaw === "string" ? statusRaw.trim().toLowerCase() : "";

  return { finished, execution_status };
}

/** GET /get-execution_id/<n8n_execution_id> — authoritative completion state. */
export async function fetchExecutionPollState(
  n8nExecutionId: string,
): Promise<ExecutionPollState | null> {
  const id = n8nExecutionId.trim();
  if (!id) return null;

  const res = await agentsApiFetch(
    `/get-execution_id/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
  const rawText = await res.text();
  let parsed: unknown = {};
  try {
    parsed = rawText.trim() ? (JSON.parse(rawText) as unknown) : {};
  } catch {
    return null;
  }
  if (!res.ok) return null;
  return parseExecutionPollState(parsed);
}
