import { useI18n } from "../../i18n/I18nProvider";

type Props = {
  summary: string;
  onDone: () => void;
  onViewAgents: () => void;
};

export function AgentCreatedSuccessView({ summary, onDone, onViewAgents }: Props) {
  const { t } = useI18n();

  return (
    <div className="create-flow-success">
      <div className="create-flow-success__scroll">
        <div className="create-flow-success__hero">
          <div className="create-flow-success__check" aria-hidden>
            ✓
          </div>
          <h2 className="create-flow-success__title">{t("success.title")}</h2>
          <p className="create-flow-success__subtitle">{t("success.subtitle")}</p>
        </div>

        <div className="create-flow-success__card">
          <p className="create-flow-success__card-label">{t("success.cardLabel")}</p>
          <p className="create-flow-success__card-body">
            {summary.trim() ? summary : t("success.emptySummary")}
          </p>
        </div>

        <div className="create-flow-success__tips">
          <p className="create-flow-success__tip-title">{t("success.tipTitle")}</p>
          <p className="create-flow-success__tip-body">{t("success.tipBody")}</p>
        </div>
      </div>

      <footer className="create-flow-success__footer">
        <button type="button" className="btn btn--primary" onClick={onViewAgents}>
          {t("success.viewAgents")}
        </button>
        <button
          type="button"
          className="create-flow-success__secondary"
          onClick={onDone}
          aria-label={t("success.backCreateA11y")}
        >
          {t("success.backCreate")}
        </button>
      </footer>
    </div>
  );
}
