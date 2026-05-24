import { useI18n } from "../../i18n/I18nProvider";

type Props = {
  onRetry: () => void;
};

export function CreateAgentErrorView({ onRetry }: Props) {
  const { t } = useI18n();

  return (
    <div className="create-flow-overlay create-flow-error" role="alert">
      <div className="create-flow-error__inner">
        <div className="create-flow-error__icon" aria-hidden>
          !
        </div>
        <p className="create-flow-error__body">{t("error.genericBody")}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          {t("error.retry")}
        </button>
      </div>
    </div>
  );
}
