import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import {
  CancelSubscriptionError,
  cancelSubscription,
} from "../../auth/cancelSubscription";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../i18n/I18nProvider";

export function CancelSubscriptionButton() {
  const { pulseToken, isAuthenticated, refreshUserProfile, requireAuth } = useAuth();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [confirmOpen]);

  const runCancel = useCallback(async () => {
    const token = pulseToken?.trim();
    if (!token) {
      showToast(t("subscription.checkoutSignIn"), "error");
      return;
    }

    setLoading(true);
    try {
      await cancelSubscription(token);
      await refreshUserProfile({ force: true });
      setConfirmOpen(false);
      showToast(t("subscription.cancelSuccess"), "info");
    } catch (e) {
      const msg =
        e instanceof CancelSubscriptionError
          ? e.message
          : t("subscription.cancelFailed");
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [pulseToken, refreshUserProfile, showToast, t]);

  const openConfirm = () => {
    if (loading) return;
    if (isAuthenticated && pulseToken?.trim()) {
      setConfirmOpen(true);
      return;
    }
    void requireAuth(() => setConfirmOpen(true), {
      modalTitle: t("auth.accountModalTitle"),
      modalSubtitle: t("auth.accountModalSub"),
    });
  };

  return (
    <>
      <button
        type="button"
        className={`cancel-subscription-btn ${loading ? "cancel-subscription-btn--loading" : ""}`.trim()}
        onClick={openConfirm}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="cancel-subscription-btn__spinner" aria-hidden />
            {t("subscription.cancelLoading")}
          </>
        ) : (
          t("subscription.cancelSubscription")
        )}
      </button>

      {confirmOpen ? (
        <div
          className="subscription-cancel-backdrop"
          role="presentation"
          onClick={loading ? undefined : () => setConfirmOpen(false)}
        >
          <div
            className="subscription-cancel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-cancel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="subscription-cancel-title" className="subscription-cancel-modal__title">
              {t("subscription.cancelConfirmTitle")}
            </h2>
            <p className="subscription-cancel-modal__body">
              {t("subscription.cancelConfirmMessage")}
            </p>
            <div className="subscription-cancel-modal__actions">
              <button
                type="button"
                className="btn btn--primary subscription-cancel-modal__confirm"
                onClick={() => void runCancel()}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="cancel-subscription-btn__spinner" aria-hidden />
                    {t("subscription.cancelLoading")}
                  </>
                ) : (
                  t("subscription.cancelConfirmYes")
                )}
              </button>
              <button
                type="button"
                className="subscription-cancel-modal__dismiss"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
              >
                {t("auth.cancel")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
