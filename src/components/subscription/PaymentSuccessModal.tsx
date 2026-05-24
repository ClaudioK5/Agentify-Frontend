import { useI18n } from "../../i18n/I18nProvider";

type Props = {
  open: boolean;
  syncing: boolean;
  onContinue: () => void;
};

export function PaymentSuccessModal({ open, syncing, onContinue }: Props) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="payment-success-backdrop"
      role="presentation"
      onClick={syncing ? undefined : onContinue}
    >
      <div
        className="payment-success-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-success-title"
        aria-busy={syncing}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="payment-success-modal__glow" aria-hidden />
        {syncing ? (
          <>
            <div className="payment-success-modal__spinner" aria-hidden />
            <p className="payment-success-modal__syncing">
              {t("subscription.paymentSyncing")}
            </p>
          </>
        ) : (
          <>
            <div className="payment-success-modal__icon" aria-hidden>
              🎉
            </div>
            <h2 id="payment-success-title" className="payment-success-modal__title">
              {t("subscription.paymentSuccessTitle")}
            </h2>
            <p className="payment-success-modal__subtitle">
              {t("subscription.paymentSuccessSubtitle")}
            </p>
            <ul className="payment-success-modal__benefits">
              <li>{t("subscription.paymentBenefitAgents")}</li>
              <li>{t("subscription.paymentBenefitWorkflows")}</li>
              <li>{t("subscription.paymentBenefitAccess")}</li>
            </ul>
            <button
              type="button"
              className="btn btn--primary payment-success-modal__cta"
              onClick={onContinue}
            >
              {t("subscription.paymentContinue")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
