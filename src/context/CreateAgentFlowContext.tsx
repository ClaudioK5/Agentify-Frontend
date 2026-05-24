import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { readPersistedUserSession } from "../auth/persistedSessionRead";
import { useI18n } from "../i18n/I18nProvider";
import { useSubscription } from "../subscription/useSubscription";
import { postConfirmAgentWebhook } from "../services/confirmAgentWebhook";
import { postCreateAgentWebhook } from "../services/createAgentWebhook";
import {
  fetchExecutionPollState,
  POLL_INTERVAL_MS,
} from "../services/executionPollingApi";
import {
  buildCorrectionFromAnswers,
  normalizeCreateAgentResponse,
  parseAgentDuplicateStatus,
  parseN8nExecutionIdFromConfirmWebhook,
  type CreateAgentApiResponse,
} from "../types/createAgent";

export type FlowPhase = "form" | "loading" | "result" | "success" | "error";

type CreateAgentFlowContextValue = {
  flowPhase: FlowPhase;
  resultData: CreateAgentApiResponse | null;
  successSummary: string | null;
  questionAnswers: string[];
  loadingPhase: "create" | "confirm";
  errorSource: "create" | "confirm";
  resetToForm: () => void;
  onCreatePress: () => void;
  onConfirmPress: () => void;
  onRetry: () => void;
  setAnswerAt: (index: number, text: string) => void;
  hideLayoutChrome: boolean;
  setCreatePrompt: (prompt: string) => void;
};

const CreateAgentFlowContext = createContext<CreateAgentFlowContextValue | null>(
  null,
);

export function CreateAgentFlowProvider({ children }: { children: ReactNode }) {
  const { requireAuth } = useAuth();
  const { t } = useI18n();
  const { isWorkflowBlocked } = useSubscription();
  const fixedEmailQuestion = t("create.emailQuestion");

  const [flowPhase, setFlowPhase] = useState<FlowPhase>("form");
  const [resultData, setResultData] = useState<CreateAgentApiResponse | null>(null);
  const [successSummary, setSuccessSummary] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<string[]>([]);
  const [loadingPhase, setLoadingPhase] = useState<"create" | "confirm">("create");
  const [errorSource, setErrorSource] = useState<"create" | "confirm">("create");

  const createPromptRef = useRef("");
  const createAgentInFlightRef = useRef(false);
  const confirmAgentInFlightRef = useRef(false);
  const confirmPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmPollActiveRef = useRef(false);
  const resultDataRef = useRef(resultData);
  const questionAnswersRef = useRef(questionAnswers);

  const stopConfirmPolling = useCallback(() => {
    confirmPollActiveRef.current = false;
    if (confirmPollTimerRef.current) {
      clearInterval(confirmPollTimerRef.current);
      confirmPollTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopConfirmPolling(), [stopConfirmPolling]);

  const setCreatePrompt = useCallback((prompt: string) => {
    createPromptRef.current = prompt;
  }, []);

  useEffect(() => {
    resultDataRef.current = resultData;
  }, [resultData]);

  useEffect(() => {
    questionAnswersRef.current = questionAnswers;
  }, [questionAnswers]);

  const resetToForm = useCallback(() => {
    stopConfirmPolling();
    setFlowPhase("form");
    setResultData(null);
    setSuccessSummary(null);
    setQuestionAnswers([]);
    setLoadingPhase("create");
    setErrorSource("create");
    createAgentInFlightRef.current = false;
    confirmAgentInFlightRef.current = false;
  }, [stopConfirmPolling]);

  const animateToResult = useCallback(
    (data: CreateAgentApiResponse, onTransitionDone?: () => void) => {
      const hasEmailQuestion = data.questions.includes(fixedEmailQuestion);
      const nextQuestions = hasEmailQuestion
        ? data.questions
        : [...data.questions, fixedEmailQuestion];
      const dataWithEmailQuestion: CreateAgentApiResponse = {
        ...data,
        questions: nextQuestions,
      };
      setResultData(dataWithEmailQuestion);
      setQuestionAnswers(nextQuestions.map(() => ""));
      setFlowPhase("result");
      onTransitionDone?.();
    },
    [fixedEmailQuestion],
  );

  const runCreateAgent = useCallback(async () => {
    if (isWorkflowBlocked) return;
    const description = createPromptRef.current.trim();
    if (!description) return;
    if (createAgentInFlightRef.current) return;
    createAgentInFlightRef.current = true;
    setLoadingPhase("create");
    setFlowPhase("loading");
    try {
      const persisted = readPersistedUserSession();
      const userId = persisted?.user?.id ?? persisted?.user?.email ?? "";
      const res = await postCreateAgentWebhook({
        description,
        user_id: userId,
        pulseToken: persisted?.pulseToken ?? null,
        execution_id: crypto.randomUUID(),
      });
      const rawText = await res.text();

      if (res.ok && parseAgentDuplicateStatus(rawText)) {
        if (import.meta.env.DEV) {
          console.log("[Agentify] create-agent duplicate — ignored, spinner stays");
        }
        return;
      }

      let parsed: unknown = {};
      if (rawText.trim()) {
        try {
          parsed = JSON.parse(rawText) as unknown;
        } catch {
          if (import.meta.env.DEV) {
            console.warn(
              "[Agentify] create-agent body is not JSON:",
              rawText.slice(0, 300),
            );
          }
          if (!res.ok) {
            throw new Error(
              res.status === 404
                ? t("create.errorWebhookNotFound")
                : t("create.errorRequestFailed", { status: res.status }),
            );
          }
          throw new Error(t("create.errorNotJson"));
        }
      }
      const data = normalizeCreateAgentResponse(parsed);
      if (!res.ok) {
        throw new Error(t("create.errorRequestFailed", { status: res.status }));
      }
      animateToResult(data, () => {
        createAgentInFlightRef.current = false;
      });
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error("[Agentify] create-agent error", e);
      }
      setErrorSource("create");
      setFlowPhase("error");
      createAgentInFlightRef.current = false;
    }
  }, [t, animateToResult, isWorkflowBlocked]);

  const runConfirmAgent = useCallback(async () => {
    if (isWorkflowBlocked) return;
    const data = resultDataRef.current;
    if (!data) return;

    stopConfirmPolling();

    confirmAgentInFlightRef.current = true;
    setLoadingPhase("confirm");
    setFlowPhase("loading");

    const finishConfirmError = () => {
      stopConfirmPolling();
      confirmAgentInFlightRef.current = false;
      setErrorSource("confirm");
      setFlowPhase("error");
    };

    const startExecutionPolling = (n8nExecutionId: string) => {
      confirmPollActiveRef.current = true;

      const applyPollState = (state: {
        finished: boolean;
        execution_status: string;
      }) => {
        if (!confirmPollActiveRef.current) return;
        if (!state.finished) return;

        stopConfirmPolling();
        confirmAgentInFlightRef.current = false;

        if (state.execution_status === "success") {
          setSuccessSummary(data.summary_for_user ?? "");
          setFlowPhase("success");
          return;
        }

        setErrorSource("confirm");
        setFlowPhase("error");
      };

      const pollOnce = async () => {
        if (!confirmPollActiveRef.current) return;
        try {
          const state = await fetchExecutionPollState(n8nExecutionId);
          if (state) applyPollState(state);
        } catch (e) {
          if (import.meta.env.DEV) {
            console.warn("[Agentify] get-execution_id poll failed — spinner continues", e);
          }
        }
      };

      if (import.meta.env.DEV) {
        console.log("[Agentify] confirm-agent polling n8n_execution_id", n8nExecutionId);
      }

      void (async () => {
        await pollOnce();
        if (!confirmPollActiveRef.current) return;
        if (!confirmAgentInFlightRef.current) return;

        confirmPollTimerRef.current = setInterval(() => {
          void pollOnce();
        }, POLL_INTERVAL_MS);
      })();
    };

    try {
      const answers = questionAnswersRef.current;
      const persisted = readPersistedUserSession();
      const userId = persisted?.user?.id ?? persisted?.user?.email ?? "";
      const emailIndex = data.questions.findIndex((q) => q === fixedEmailQuestion);
      const user_email =
        emailIndex >= 0 ? (answers[emailIndex] ?? "").trim() : "";
      const questionsForCorrection =
        emailIndex >= 0
          ? data.questions.filter((_, i) => i !== emailIndex)
          : data.questions;
      const answersForCorrection =
        emailIndex >= 0
          ? answers.filter((_, i) => i !== emailIndex)
          : answers;
      const correction = buildCorrectionFromAnswers(
        questionsForCorrection,
        answersForCorrection,
      );

      const { rawText } = await postConfirmAgentWebhook({
        correction,
        user_email,
        user_id: userId,
        description: data.description,
        text: data.text,
        summary_for_user: data.summary_for_user,
        what_will_happen: data.what_will_happen,
        notes: data.nodes,
        graph: data.graph,
        user_goal: data.user_goal,
        workflow_strategy: data.workflow_strategy,
        reasoning: data.reasoning,
        pulseToken: persisted?.pulseToken ?? null,
        execution_id: crypto.randomUUID(),
      });

      const n8nExecutionId = parseN8nExecutionIdFromConfirmWebhook(rawText);
      if (!n8nExecutionId) {
        if (import.meta.env.DEV) {
          console.error(
            "[Agentify] confirm-agent: missing n8n_execution_id in webhook response",
            rawText.slice(0, 300),
          );
        }
        finishConfirmError();
        return;
      }

      startExecutionPolling(n8nExecutionId);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error("[Agentify] confirm-agent webhook failed", e);
      }
      finishConfirmError();
    }
  }, [fixedEmailQuestion, isWorkflowBlocked, stopConfirmPolling]);

  const onCreatePress = useCallback(() => {
    void requireAuth(runCreateAgent);
  }, [requireAuth, runCreateAgent]);

  const onConfirmPress = useCallback(() => {
    void requireAuth(runConfirmAgent);
  }, [requireAuth, runConfirmAgent]);

  const onRetry = useCallback(() => {
    void requireAuth(errorSource === "confirm" ? runConfirmAgent : runCreateAgent);
  }, [requireAuth, errorSource, runConfirmAgent, runCreateAgent]);

  const setAnswerAt = useCallback((index: number, text: string) => {
    setQuestionAnswers((prev) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
  }, []);

  const hideLayoutChrome =
    flowPhase === "result" &&
    resultData !== null &&
    resultData.questions.length > 0;

  const value = useMemo(
    () => ({
      flowPhase,
      resultData,
      successSummary,
      questionAnswers,
      loadingPhase,
      errorSource,
      resetToForm,
      onCreatePress,
      onConfirmPress,
      onRetry,
      setAnswerAt,
      hideLayoutChrome,
      setCreatePrompt,
    }),
    [
      flowPhase,
      resultData,
      successSummary,
      questionAnswers,
      loadingPhase,
      errorSource,
      resetToForm,
      onCreatePress,
      onConfirmPress,
      onRetry,
      setAnswerAt,
      hideLayoutChrome,
      setCreatePrompt,
    ],
  );

  return (
    <CreateAgentFlowContext.Provider value={value}>
      {children}
    </CreateAgentFlowContext.Provider>
  );
}

export function useCreateAgentFlowContext(): CreateAgentFlowContextValue {
  const ctx = useContext(CreateAgentFlowContext);
  if (!ctx) {
    throw new Error("useCreateAgentFlow must be used within CreateAgentFlowProvider");
  }
  return ctx;
}
