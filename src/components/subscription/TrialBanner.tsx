import { useI18n } from "../../i18n/I18nProvider";
import { useSubscription } from "../../subscription/useSubscription";
import { UpgradeProButton } from "./UpgradeProButton";

export function TrialBanner() {
  const { t } = useI18n();
  const { showTrialBanner, remainingTrialDays } = useSubscription();

  if (!showTrialBanner) return null;

  const daysLabel =
    remainingTrialDays === 1
      ? t("subscription.bannerDaysOne")
      : t("subscription.bannerDays", { days: remainingTrialDays });

  return (
    <aside className="trial-banner" role="status" aria-live="polite">
      <div className="trial-banner__inner">
        <p className="trial-banner__text">
          <span className="trial-banner__spark" aria-hidden>
            ✨
          </span>
          {daysLabel}
        </p>
        <UpgradeProButton variant="banner" />
      </div>
    </aside>
  );
}
