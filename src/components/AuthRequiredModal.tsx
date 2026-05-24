import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { getGoogleWebClientId } from "../auth/apiConfig";
import { GoogleGLogo } from "./GoogleGLogo";

type AuthRequiredModalProps = {
  visible: boolean;
  onClose: () => void;
  onGoogleCredential: (idToken: string) => void;
  onGoogleError: () => void;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
};

export function AuthRequiredModal({
  visible,
  onClose,
  onGoogleCredential,
  onGoogleError,
  isLoading = false,
  title,
  subtitle,
}: AuthRequiredModalProps) {
  const { t, locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const clientId = getGoogleWebClientId();

  useEffect(() => {
    if (!visible) {
      setMounted(false);
      return;
    }
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, isLoading, onClose]);

  if (!visible) return null;

  function handleSuccess(response: CredentialResponse) {
    const credential = response.credential;
    if (!credential) {
      onGoogleError();
      return;
    }
    onGoogleCredential(credential);
  }

  return (
    <div
      className={`auth-modal-backdrop ${mounted ? "auth-modal-backdrop--open" : ""}`}
      role="presentation"
      onClick={() => !isLoading && onClose()}
    >
      <div
        className={`auth-modal-sheet ${mounted ? "auth-modal-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-handle" aria-hidden />
        <h2 id="auth-modal-title" className="auth-modal-title">
          {title ?? t("auth.saveProgress")}
        </h2>
        <p className="auth-modal-subtitle">
          {subtitle ?? t("auth.saveProgressSub")}
        </p>

        <div className="auth-modal-action">
          {clientId ? (
            <div className="auth-google-btn-wrap">
              <span className="auth-google-btn-label">
                <GoogleGLogo size={22} />
                {isLoading ? t("auth.connecting") : t("auth.continueGoogle")}
              </span>
              <div
                className={`auth-google-btn-overlay ${isLoading ? "auth-google-btn-overlay--disabled" : ""}`}
                aria-hidden={isLoading}
              >
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={onGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                  locale={locale}
                />
              </div>
            </div>
          ) : (
            <p className="auth-modal-error">{t("auth.errorGoogleNotConfigured")}</p>
          )}
        </div>

        <p className="auth-modal-helper">{t("auth.noPasswords")}</p>

        <button
          type="button"
          className="auth-modal-cancel"
          onClick={onClose}
          disabled={isLoading}
        >
          {t("auth.cancel")}
        </button>
      </div>
    </div>
  );
}
