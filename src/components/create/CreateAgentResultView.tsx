import { useI18n } from "../../i18n/I18nProvider";
import type { CreateAgentApiResponse } from "../../types/createAgent";

type Props = {
  data: CreateAgentApiResponse;
  questionAnswers: string[];
  onChangeAnswer: (index: number, text: string) => void;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  emailQuestionIndex?: number;
  onBack: () => void;
};

export function CreateAgentResultView({
  data,
  questionAnswers,
  onChangeAnswer,
  primaryLabel,
  onPrimaryPress,
  primaryDisabled = false,
  emailQuestionIndex = -1,
  onBack,
}: Props) {
  const { t } = useI18n();
  const hasQuestions = data.questions.length > 0;

  return (
    <div className="create-flow-result">
      <header className="create-flow-result__header">
        <button
          type="button"
          className="create-flow-result__back"
          onClick={onBack}
          aria-label={t("createResult.backA11y")}
        >
          ←
        </button>
        <h2 className="create-flow-result__title">{t("createResult.header")}</h2>
        <span className="create-flow-result__spacer" aria-hidden />
      </header>

      <div className="create-flow-result__scroll">
        <p className="create-flow-result__kicker">{t("createResult.kicker")}</p>
        <p className="create-flow-result__summary">
          {data.summary_for_user || "—"}
        </p>

        <h3 className="create-flow-result__section">{t("createResult.whatWillHappen")}</h3>
        <div className="create-flow-result__steps">
          {data.what_will_happen.length === 0 ? (
            <p className="create-flow-result__empty">{t("createResult.noSteps")}</p>
          ) : (
            data.what_will_happen.map((step, i) => (
              <div key={`step-${i}`} className="create-flow-result__step">
                <span className="create-flow-result__step-badge">{i + 1}</span>
                <p className="create-flow-result__step-text">{step}</p>
              </div>
            ))
          )}
        </div>

        {hasQuestions ? (
          <>
            <h3 className="create-flow-result__section">{t("createResult.questions")}</h3>
            <p className="create-flow-result__hint">{t("createResult.questionsHint")}</p>
            {data.questions.map((q, i) => {
              const isEmailQuestion = i === emailQuestionIndex;
              return (
                <div key={`q-${i}`} className="create-flow-result__question">
                  <label className="create-flow-result__q-label" htmlFor={`create-q-${i}`}>
                    {q}
                    {isEmailQuestion ? (
                      <span className="create-flow-result__required" aria-hidden>
                        {" "}
                        *
                      </span>
                    ) : null}
                  </label>
                  <textarea
                    id={`create-q-${i}`}
                    className="create-flow-result__q-input"
                    value={questionAnswers[i] ?? ""}
                    onChange={(e) => onChangeAnswer(i, e.target.value)}
                    placeholder={t("createResult.answerPlaceholder")}
                    rows={3}
                    required={isEmailQuestion}
                    aria-required={isEmailQuestion}
                    inputMode={isEmailQuestion ? "email" : undefined}
                    autoComplete={isEmailQuestion ? "email" : undefined}
                  />
                </div>
              );
            })}
          </>
        ) : null}
      </div>

      <footer className="create-flow-result__footer">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onPrimaryPress}
          disabled={primaryDisabled}
          aria-disabled={primaryDisabled}
        >
          {primaryLabel}
        </button>
      </footer>
    </div>
  );
}

