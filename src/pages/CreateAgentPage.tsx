import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AgentCreatedSuccessView } from "../components/create/AgentCreatedSuccessView";
import { CreateAgentErrorView } from "../components/create/CreateAgentErrorView";
import { CreateAgentLoadingOverlay } from "../components/create/CreateAgentLoadingOverlay";
import { CreateAgentResultView } from "../components/create/CreateAgentResultView";
import { ExamplesModal } from "../components/ExamplesModal";
import {
  FUN_OPTIONS,
  LEARN_OPTIONS,
  NEWS_OPTIONS,
} from "../create/promptOptions";
import { TrialBanner } from "../components/subscription/TrialBanner";
import { useCreateAgentFlow } from "../hooks/useCreateAgentFlow";
import { useCreateAgentPrompt } from "../hooks/useCreateAgentPrompt";

export function CreateAgentPage() {
  const navigate = useNavigate();
  const promptState = useCreateAgentPrompt();
  const {
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
    t,
  } = promptState;

  const flow = useCreateAgentFlow(prompt);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "create-hide-chrome",
      flow.hideLayoutChrome,
    );
    return () => document.documentElement.classList.remove("create-hide-chrome");
  }, [flow.hideLayoutChrome]);

  const showForm = flow.flowPhase === "form";
  const primaryLabel =
    flow.resultData && flow.resultData.questions.length > 0
      ? t("create.continue")
      : t("create.createAgent");

  return (
    <section className="create-page create-page--flow">
      <TrialBanner />
      {showForm ? (
        <>
          <div className="create-page__hero">
            <h1 className="create-page__title">{t("create.title")}</h1>
            <p className="create-page__subtitle">{t("create.subtitle")}</p>
          </div>

          <div className="create-page__body">
            <div
              className="chips"
              role="toolbar"
              aria-label={t("create.promptToolbar")}
            >
              {promptChips.map((chip) => {
                const selected = activePromptChip === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    className={`chip ${selected ? "chip--active" : ""}`}
                    onClick={() => onPromptChipPress(chip.id)}
                    aria-pressed={selected}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {activePromptChip === "learn" && (
              <div
                className="option-row"
                role="group"
                aria-label={t("create.learnOptionsAria")}
              >
                {LEARN_OPTIONS.map((option) => {
                  const selected = selectedLearnOption === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`sub-chip ${selected ? "sub-chip--active" : ""}`}
                      onClick={() => onLearnOptionPress(option)}
                      aria-pressed={selected}
                    >
                      {option.emoji} {learnOptionLabels[option.id]}
                    </button>
                  );
                })}
              </div>
            )}
            {activePromptChip === "learn" &&
              selectedLearnOption &&
              learnOptionHints[selectedLearnOption] && (
                <p className="option-hint">{learnOptionHints[selectedLearnOption]}</p>
              )}

            {activePromptChip === "fun" && (
              <div
                className="option-row"
                role="group"
                aria-label={t("create.funOptionsAria")}
              >
                {FUN_OPTIONS.map((option) => {
                  const selected = selectedFunOption === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`sub-chip ${selected ? "sub-chip--active" : ""}`}
                      onClick={() => onFunOptionPress(option)}
                      aria-pressed={selected}
                    >
                      {option.emoji} {funOptionLabels[option.id]}
                    </button>
                  );
                })}
              </div>
            )}
            {activePromptChip === "fun" &&
              selectedFunOption &&
              funOptionHints[selectedFunOption] && (
                <p className="option-hint">{funOptionHints[selectedFunOption]}</p>
              )}

            {activePromptChip === "alerts" && (
              <div
                className="option-row"
                role="group"
                aria-label={t("create.newsOptionsAria")}
              >
                {NEWS_OPTIONS.map((option) => {
                  const selected = selectedNewsOption === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`sub-chip ${selected ? "sub-chip--active" : ""}`}
                      onClick={() => onNewsOptionPress(option)}
                      aria-pressed={selected}
                    >
                      {option.emoji} {newsOptionLabels[option.id]}
                    </button>
                  );
                })}
              </div>
            )}
            {activePromptChip === "alerts" &&
              selectedNewsOption &&
              newsOptionHints[selectedNewsOption] && (
                <p className="option-hint">{newsOptionHints[selectedNewsOption]}</p>
              )}

            {selectedExamples.length > 0 && (
              <button
                type="button"
                className="examples-cta"
                onClick={() => setExamplesOpen(true)}
              >
                {t("create.examplesCta")}
              </button>
            )}

            <form
              className="create-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                flow.onCreatePress();
              }}
            >
              <label htmlFor="agent-description" className="visually-hidden">
                {t("create.agentDescriptionLabel")}
              </label>
              <textarea
                ref={promptInputRef}
                id="agent-description"
                className="create-form__input"
                placeholder={t("create.placeholder")}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                rows={6}
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!canSubmit}
              >
                {t("create.createAgent")}
              </button>
              <p className="create-form__hint">{t("create.hintFooter")}</p>
            </form>
          </div>

          <ExamplesModal
            open={examplesOpen}
            pairs={selectedExamplePairs}
            onClose={() => setExamplesOpen(false)}
          />
        </>
      ) : null}

      {flow.flowPhase === "loading" ? (
        <CreateAgentLoadingOverlay phase={flow.loadingPhase} />
      ) : null}

      {flow.flowPhase === "result" && flow.resultData ? (
        <CreateAgentResultView
          data={flow.resultData}
          questionAnswers={flow.questionAnswers}
          onChangeAnswer={flow.setAnswerAt}
          primaryLabel={primaryLabel}
          onPrimaryPress={flow.onConfirmPress}
          primaryDisabled={!flow.canConfirmPress}
          emailQuestionIndex={flow.emailQuestionIndex}
          onBack={flow.resetToForm}
        />
      ) : null}

      {flow.flowPhase === "success" ? (
        <AgentCreatedSuccessView
          summary={
            flow.resultData?.summary_for_user ??
            flow.successSummary ??
            ""
          }
          onDone={flow.resetToForm}
          onViewAgents={() => {
            flow.resetToForm();
            navigate("/agents");
          }}
        />
      ) : null}

      {flow.flowPhase === "error" ? (
        <CreateAgentErrorView onRetry={flow.onRetry} />
      ) : null}
    </section>
  );
}

