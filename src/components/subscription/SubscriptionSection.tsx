import { useEffect } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import {
  formatSubscriptionDate,
} from "../../subscription/subscriptionUtils";
import { useSubscription } from "../../subscription/useSubscription";
import { CancelSubscriptionButton } from "./CancelSubscriptionButton";
import { UpgradeProButton } from "./UpgradeProButton";

export function SubscriptionSection() {
  const { t, locale } = useI18n();
  const sub = useSubscription();

  useEffect(() => {
    if (window.location.hash !== "#subscription") return;
    const el = document.getElementById("subscription");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const planLabel =
    sub.plan === "free_trial" || sub.isTrialing
      ? t("subscription.planFreeTrial")
      : sub.isActive
        ? t("subscription.planPro")
        : sub.plan;

  const statusLabel =
    sub.subscriptionStatus === "trialing"
      ? t("subscription.statusTrialing")
      : sub.subscriptionStatus === "active"
        ? t("subscription.statusActive")
        : sub.subscriptionStatus === "canceled"
          ? t("subscription.statusCanceled")
          : sub.subscriptionStatus;

  const trialEndsFormatted = formatSubscriptionDate(sub.trialEndsAt, locale);

  return (
    <section id="subscription" className="subscription-section">
      <h2 className="subscription-section__title">{t("subscription.sectionTitle")}</h2>

      <dl className="subscription-section__fields">
        <div className="subscription-field">
          <dt>{t("subscription.currentPlan")}</dt>
          <dd>{planLabel}</dd>
        </div>
        <div className="subscription-field">
          <dt>{t("subscription.status")}</dt>
          <dd>
            <span
              className={`subscription-status subscription-status--${sub.subscriptionStatus || "unknown"}`}
            >
              {statusLabel}
            </span>
          </dd>
        </div>
        {sub.trialEndsAt ? (
          <div className="subscription-field">
            <dt>{t("subscription.trialEnds")}</dt>
            <dd>
              {trialEndsFormatted}
              {sub.isTrialing && sub.remainingTrialDays > 0 ? (
                <span className="subscription-field__meta">
                  {" "}
                  · {t("subscription.daysLeft", { days: sub.remainingTrialDays })}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        <div className="subscription-field">
          <dt>{t("subscription.afterTrial")}</dt>
          <dd>{t("subscription.afterTrialPrice")}</dd>
        </div>
      </dl>

      <div className="subscription-section__pricing">
        <p>{t("subscription.pricingTrial")}</p>
        <p>{t("subscription.pricingThen")}</p>
        <p className="subscription-section__cancel">{t("subscription.pricingCancel")}</p>
      </div>

      <div className="subscription-section__actions">
        {sub.isActive ? (
          <CancelSubscriptionButton />
        ) : (
          <UpgradeProButton variant="primary" />
        )}
      </div>
    </section>
  );
}
