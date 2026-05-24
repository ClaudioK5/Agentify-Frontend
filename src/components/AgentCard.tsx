import { formatWorkflowDisplay } from "../api/agentsApi";
import type { MyAgentListItem } from "../types/myAgent";
import { SparklesIcon } from "./Icons";

type AgentCardProps = {
  agent: MyAgentListItem;
  title: string;
  openHint: string;
  workflowLabel: string;
  runLabel: string;
  deleteLabel: string;
  busy: boolean;
  onRun: () => void;
  onDelete: () => void;
};

export function AgentCard({
  agent,
  title,
  openHint,
  workflowLabel,
  runLabel,
  deleteLabel,
  busy,
  onRun,
  onDelete,
}: AgentCardProps) {
  return (
    <article className="my-agent-card">
      <div className="my-agent-card__header">
        <div className="my-agent-card__icon" aria-hidden>
          <SparklesIcon />
        </div>
        <div className="my-agent-card__header-text">
          <h2 className="my-agent-card__title">{title}</h2>
          <p className="my-agent-card__hint">{openHint}</p>
        </div>
      </div>

      <div className="my-agent-card__workflow">
        <span className="my-agent-card__workflow-label">{workflowLabel}</span>
        <code className="my-agent-card__workflow-id" title={agent.workflow_id}>
          {formatWorkflowDisplay(agent.workflow_id)}
        </code>
      </div>

      <div className="my-agent-card__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy}
          onClick={onRun}
        >
          {runLabel}
        </button>
        <button
          type="button"
          className="btn btn--danger-outline"
          disabled={busy}
          onClick={onDelete}
        >
          {deleteLabel}
        </button>
      </div>
    </article>
  );
}
