import { useCallback, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import type { AppStringKey } from "../i18n/strings";
import { getPromptTemplates, type PromptChipId } from "../i18n/promptTemplates";
import {
  FUN_OPTIONS,
  LEARN_OPTIONS,
  NEWS_OPTIONS,
  type FunOptionId,
  type LearnOptionId,
  type NewsOptionId,
} from "../create/promptOptions";
import { pickTemplateForCategory } from "../create/pickTemplate";

export type ExamplePair = { title: string; detail: string };

export function useCreateAgentPrompt() {
  const { locale, t } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [activePromptChip, setActivePromptChip] = useState<PromptChipId | null>(
    null,
  );
  const [selectedLearnOption, setSelectedLearnOption] =
    useState<LearnOptionId | null>(null);
  const [selectedFunOption, setSelectedFunOption] = useState<FunOptionId | null>(
    null,
  );
  const [selectedNewsOption, setSelectedNewsOption] =
    useState<NewsOptionId | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const promptTemplates = useMemo(
    () => getPromptTemplates(locale),
    [locale],
  );

  const promptChips = useMemo(
    () =>
      [
        { id: "learn" as const, label: t("create.chipLearn") },
        { id: "fun" as const, label: t("create.chipFun") },
        { id: "alerts" as const, label: t("create.chipAlerts") },
      ] as const,
    [t],
  );

  const learnOptionLabels = useMemo(
    () => ({
      interview: t("create.learnOptionInterview"),
      quiz: t("create.learnOptionQuiz"),
      exercise: t("create.learnOptionExercise"),
    }),
    [t],
  );

  const learnOptionHints = useMemo(
    () => ({
      interview: t("create.learnOptionInterviewHint"),
      quiz: t("create.learnOptionQuizHint"),
      exercise: t("create.learnOptionExerciseHint"),
    }),
    [t],
  );

  const funOptionLabels = useMemo(
    () => ({
      riddles: t("create.funOptionRiddles"),
      facts: t("create.funOptionFacts"),
    }),
    [t],
  );

  const funOptionHints = useMemo(
    () => ({
      riddles: t("create.funOptionRiddlesHint"),
      facts: t("create.funOptionFactsHint"),
    }),
    [t],
  );

  const newsOptionLabels = useMemo(
    () => ({
      briefing: t("create.newsOptionBriefing"),
      tracker: t("create.newsOptionTracker"),
    }),
    [t],
  );

  const newsOptionHints = useMemo(
    () => ({
      briefing: t("create.newsOptionBriefingHint"),
      tracker: t("create.newsOptionTrackerHint"),
    }),
    [t],
  );

  const exampleKeys: Record<string, AppStringKey> = useMemo(
    () => ({
      learnInterview: "create.examplesLearnInterview",
      learnQuiz: "create.examplesLearnQuiz",
      learnExercise: "create.examplesLearnExercise",
      funRiddles: "create.examplesFunRiddles",
      funFacts: "create.examplesFunFacts",
      newsBriefing: "create.examplesNewsBriefing",
      newsTracker: "create.examplesNewsTracker",
    }),
    [],
  );

  const selectedExamplesText = useMemo(() => {
    if (activePromptChip === "learn" && selectedLearnOption) {
      const key =
        selectedLearnOption === "interview"
          ? "learnInterview"
          : selectedLearnOption === "quiz"
            ? "learnQuiz"
            : "learnExercise";
      return t(exampleKeys[key]);
    }
    if (activePromptChip === "fun" && selectedFunOption) {
      const key = selectedFunOption === "riddles" ? "funRiddles" : "funFacts";
      return t(exampleKeys[key]);
    }
    if (activePromptChip === "alerts" && selectedNewsOption) {
      const key =
        selectedNewsOption === "briefing" ? "newsBriefing" : "newsTracker";
      return t(exampleKeys[key]);
    }
    return "";
  }, [
    activePromptChip,
    selectedLearnOption,
    selectedFunOption,
    selectedNewsOption,
    exampleKeys,
    t,
  ]);

  const selectedExamples = useMemo(
    () =>
      selectedExamplesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [selectedExamplesText],
  );

  const selectedExamplePairs = useMemo((): ExamplePair[] => {
    const pairs: ExamplePair[] = [];
    for (let i = 0; i < selectedExamples.length; i += 2) {
      pairs.push({
        title: selectedExamples[i] ?? "",
        detail: selectedExamples[i + 1] ?? "",
      });
    }
    return pairs;
  }, [selectedExamples]);

  const canSubmit = prompt.trim().length > 0;

  const onPromptChange = useCallback(
    (text: string) => {
      setPrompt(text);
      setActivePromptChip((prev) => {
        if (!prev) return null;
        return promptTemplates[prev].includes(text) ? prev : null;
      });
      const matchedLearn = LEARN_OPTIONS.find(
        (o) => promptTemplates.learn[o.templateIndex] === text,
      );
      setSelectedLearnOption(matchedLearn?.id ?? null);
      const matchedFun = FUN_OPTIONS.find(
        (o) => promptTemplates.fun[o.templateIndex] === text,
      );
      setSelectedFunOption(matchedFun?.id ?? null);
      const matchedNews = NEWS_OPTIONS.find(
        (o) => promptTemplates.alerts[o.templateIndex] === text,
      );
      setSelectedNewsOption(matchedNews?.id ?? null);
    },
    [promptTemplates],
  );

  const focusPromptEnd = useCallback((len: number) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const input = promptInputRef.current;
        if (!input) return;
        input.focus();
        input.setSelectionRange(len, len);
      });
    });
  }, []);

  const onPromptChipPress = useCallback(
    (chipId: PromptChipId) => {
      if (chipId === "learn") {
        setActivePromptChip("learn");
        return;
      }
      if (chipId === "fun") {
        setActivePromptChip("fun");
        return;
      }
      if (chipId === "alerts") {
        setActivePromptChip("alerts");
        return;
      }
      const next = pickTemplateForCategory(chipId, prompt, promptTemplates);
      setActivePromptChip(chipId);
      setSelectedLearnOption(null);
      setSelectedFunOption(null);
      setSelectedNewsOption(null);
      setPrompt(next);
      focusPromptEnd(next.length);
    },
    [prompt, promptTemplates, focusPromptEnd],
  );

  const onLearnOptionPress = useCallback(
    (option: (typeof LEARN_OPTIONS)[number]) => {
      const next = promptTemplates.learn[option.templateIndex];
      if (!next) return;
      setActivePromptChip("learn");
      setSelectedLearnOption(option.id);
      setPrompt(next);
      focusPromptEnd(next.length);
    },
    [promptTemplates, focusPromptEnd],
  );

  const onFunOptionPress = useCallback(
    (option: (typeof FUN_OPTIONS)[number]) => {
      const next = promptTemplates.fun[option.templateIndex];
      if (!next) return;
      setActivePromptChip("fun");
      setSelectedFunOption(option.id);
      setPrompt(next);
      focusPromptEnd(next.length);
    },
    [promptTemplates, focusPromptEnd],
  );

  const onNewsOptionPress = useCallback(
    (option: (typeof NEWS_OPTIONS)[number]) => {
      const next = promptTemplates.alerts[option.templateIndex];
      if (!next) return;
      setActivePromptChip("alerts");
      setSelectedNewsOption(option.id);
      setPrompt(next);
      focusPromptEnd(next.length);
    },
    [promptTemplates, focusPromptEnd],
  );

  const resetPrompt = useCallback(() => {
    setPrompt("");
    setActivePromptChip(null);
    setSelectedLearnOption(null);
    setSelectedFunOption(null);
    setSelectedNewsOption(null);
  }, []);

  return {
    prompt,
    canSubmit,
    promptInputRef,
    promptChips,
    activePromptChip,
    selectedLearnOption,
    selectedFunOption,
    selectedNewsOption,
    learnOptionLabels,
    learnOptionHints,
    funOptionLabels,
    funOptionHints,
    newsOptionLabels,
    newsOptionHints,
    selectedExamples,
    selectedExamplePairs,
    examplesOpen,
    setExamplesOpen,
    onPromptChange,
    onPromptChipPress,
    onLearnOptionPress,
    onFunOptionPress,
    onNewsOptionPress,
    resetPrompt,
    t,
  };
}
