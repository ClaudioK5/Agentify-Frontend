import { useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useI18n } from "../../i18n/I18nProvider";
import { useSubscription } from "../../subscription/useSubscription";
import { UpgradeProButton } from "./UpgradeProButton";

export function TrialExpiredModal() {
  const { isAuthenticated } = useAuth();
  const { isTrialExpired } = useSubscription();
  const { t } = useI18n();

  const visible = isAuthenticated && isTrialExpired;

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="trial-expired-backdrop"
      role="presentation"
      aria-hidden={false}
    >
      <div
        className="trial-expired-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-expired-title"
      >
        <div className="trial-expired-modal__glow" aria-hidden />
        <h2 id="trial-expired-title" className="trial-expired-modal__title">
          {t("subscription.expiredTitle")}
        </h2>
        <p className="trial-expired-modal__body">{t("subscription.expiredPaused")}</p>
        <p className="trial-expired-modal__body trial-expired-modal__body--muted">
          {t("subscription.expiredUpgrade")}
        </p>
        <div className="trial-expired-modal__pricing">
          <p>{t("subscription.pricingTrial")}</p>
          <p>{t("subscription.pricingThen")}</p>
          <p className="trial-expired-modal__cancel">{t("subscription.pricingCancel")}</p>
        </div>
        <UpgradeProButton variant="primary" className="trial-expired-modal__cta" />
      </div>
    </div>
  );
}
