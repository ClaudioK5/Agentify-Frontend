import { useCallback, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import {
  CheckoutSessionError,
  createCheckoutSession,
} from "../../auth/createCheckoutSession";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../i18n/I18nProvider";

type Props = {
  variant?: "primary" | "ghost" | "banner";
  className?: string;
};

export function UpgradeProButton({ variant = "primary", className = "" }: Props) {
  const { pulseToken, isAuthenticated, requireAuth } = useAuth();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const startCheckout = useCallback(async () => {
    const token = pulseToken?.trim();
    if (!token) {
      showToast(t("subscription.checkoutSignIn"), "error");
      return;
    }

    setLoading(true);
    try {
      const url = await createCheckoutSession(token);
      window.location.href = url;
    } catch (e) {
      const msg =
        e instanceof CheckoutSessionError
          ? e.message
          : t("subscription.checkoutFailed");
      showToast(msg, "error");
      setLoading(false);
    }
  }, [pulseToken, showToast, t]);

  const onClick = () => {
    if (loading) return;
    if (isAuthenticated && pulseToken?.trim()) {
      void startCheckout();
      return;
    }
    void requireAuth(startCheckout, {
      modalTitle: t("auth.accountModalTitle"),
      modalSubtitle: t("auth.accountModalSub"),
    });
  };

  return (
    <button
      type="button"
      className={`upgrade-pro-btn upgrade-pro-btn--${variant} ${loading ? "upgrade-pro-btn--loading" : ""} ${className}`.trim()}
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="upgrade-pro-btn__spinner" aria-hidden />
          {t("subscription.checkoutLoading")}
        </>
      ) : (
        t("subscription.upgradePro")
      )}
    </button>
  );
}
