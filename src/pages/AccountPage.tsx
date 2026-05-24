import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { SubscriptionSection } from "../components/subscription/SubscriptionSection";
import { useI18n } from "../i18n/I18nProvider";

export function AccountPage() {
  const { session, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const user = session?.user;

  if (!isAuthenticated || !session?.pulseToken) {
    return <Navigate to="/" replace />;
  }

  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <section className="account-page">
      <h1 className="account-page__title">{t("account.title")}</h1>
      <p className="account-page__sub">{t("account.sub")}</p>

      <div className="account-card">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={t("account.profilePhoto")}
            className="account-card__avatar"
            width={72}
            height={72}
          />
        ) : (
          <div className="account-card__avatar account-card__avatar--placeholder">
            {initial}
          </div>
        )}
        <dl className="account-fields">
          <div className="account-field">
            <dt>{t("account.name")}</dt>
            <dd>{user?.name ?? "—"}</dd>
          </div>
          <div className="account-field">
            <dt>{t("account.email")}</dt>
            <dd>{user?.email ?? "—"}</dd>
          </div>
          {user?.id ? (
            <div className="account-field">
              <dt>{t("account.userId")}</dt>
              <dd>{user.id}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <SubscriptionSection />
    </section>
  );
}
