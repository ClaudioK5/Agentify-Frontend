import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAgent,
  fetchMyAgents,
  runAgent,
} from "../api/agentsApi";
import { useAuth } from "../auth/AuthProvider";
import { readPersistedUserSession } from "../auth/persistedSessionRead";
import { AgentCard } from "../components/AgentCard";
import { useToast } from "../context/ToastContext";
import { useI18n } from "../i18n/I18nProvider";
import { useSubscription } from "../subscription/useSubscription";
import type { MyAgentListItem } from "../types/myAgent";

export function MyAgentsPage() {
  const { session } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { isWorkflowBlocked } = useSubscription();
  const [agents, setAgents] = useState<MyAgentListItem[]>([]);
  const [busyWorkflowId, setBusyWorkflowId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const resolveUserEmail = useCallback(async (): Promise<string> => {
    const sessionEmail = session?.user?.email?.trim();
    if (sessionEmail) return sessionEmail.toLowerCase();
    const persisted = readPersistedUserSession();
    return (persisted?.user?.email?.trim() ?? "").toLowerCase();
  }, [session?.user?.email]);

  const formatLoadError = useCallback(
    (result: Extract<Awaited<ReturnType<typeof fetchMyAgents>>, { ok: false }>) => {
      if (result.code === "no_email") return t("myAgents.noEmail");
      if (result.code === "network") return t("myAgents.loadFailed");
      if (result.code === "server" && result.message) {
        return `${t("myAgents.loadFailed")} (${result.message})`;
      }
      return t("myAgents.loadFailed");
    },
    [t],
  );

  const refreshAgents = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const userEmail = await resolveUserEmail();
      const result = await fetchMyAgents(userEmail);
      if (!result.ok) {
        setAgents([]);
        setLoadError(formatLoadError(result));
        return;
      }
      setAgents(result.agents);
      setLoadError(null);
    } catch {
      setAgents([]);
      setLoadError(t("myAgents.loadFailed"));
    } finally {
      setIsRefreshing(false);
    }
  }, [resolveUserEmail, formatLoadError, t]);

  useEffect(() => {
    void refreshAgents();
  }, [refreshAgents]);

  const onRunAgent = async (agent: MyAgentListItem) => {
    if (isWorkflowBlocked) {
      showToast(t("subscription.workflowBlocked"), "error");
      return;
    }
    setBusyWorkflowId(agent.workflow_id);
    try {
      const result = await runAgent(agent.workflow_id);
      if (!result.ok) {
        showToast(t("myAgents.runFailed", { message: result.message }), "error");
        return;
      }
      showToast(t("myAgents.runSuccess"), "info");
    } catch {
      showToast(t("myAgents.runFailed", { message: t("myAgents.loadFailed") }), "error");
    } finally {
      setBusyWorkflowId(null);
    }
  };

  const onDeleteAgent = (agent: MyAgentListItem) => {
    const confirmed = window.confirm(
      t("myAgents.deleteConfirm", { id: agent.workflow_id }),
    );
    if (!confirmed) return;

    void (async () => {
      setBusyWorkflowId(agent.workflow_id);
      try {
        const result = await deleteAgent(agent.workflow_id);
        if (!result.ok) {
          showToast(t("myAgents.deleteFailed", { message: result.message }), "error");
          return;
        }
        setAgents((prev) =>
          prev.filter((x) => x.workflow_id !== agent.workflow_id),
        );
      } catch {
        showToast(t("myAgents.deleteFailed", { message: t("myAgents.loadFailed") }), "error");
      } finally {
        setBusyWorkflowId(null);
      }
    })();
  };

  const busy = (id: string) => busyWorkflowId === id;
  const emptyMessage = loadError ?? t("myAgents.empty");

  return (
    <section className="my-agents-page">
      <header className="my-agents-page__header">
        <div>
          <h1 className="my-agents-page__title">{t("myAgents.title")}</h1>
          <p className="my-agents-page__subtitle">{t("myAgents.subtitle")}</p>
        </div>
        <button
          type="button"
          className="btn btn--secondary my-agents-page__refresh"
          onClick={() => void refreshAgents()}
          disabled={isRefreshing}
        >
          {isRefreshing ? t("myAgents.refreshing") : t("myAgents.refresh")}
        </button>
      </header>

      {isRefreshing && agents.length === 0 && !loadError ? (
        <p className="my-agents-page__status" role="status">
          {t("myAgents.loading")}
        </p>
      ) : null}

      {agents.length === 0 && !isRefreshing ? (
        <div className="my-agents-page__empty">
          <p>{emptyMessage}</p>
          {!loadError ? (
            <Link to="/" className="btn btn--secondary">
              {t("myAgents.createFirst")}
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="my-agents-list">
          {agents.map((agent) => (
            <li key={agent.workflow_id}>
              <AgentCard
                agent={agent}
                title={t("myAgents.agentTitle")}
                openHint={t("myAgents.openHint")}
                workflowLabel={t("myAgents.workflowLabel")}
                runLabel={t("myAgents.runCta")}
                deleteLabel={t("myAgents.deleteCta")}
                busy={busy(agent.workflow_id)}
                onRun={() => void onRunAgent(agent)}
                onDelete={() => onDeleteAgent(agent)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
