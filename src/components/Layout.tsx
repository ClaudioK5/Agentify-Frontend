import { useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "../i18n/I18nProvider";
import { AccountMenu } from "./AccountMenu";
import { ThemeToggle } from "./ThemeToggle";
import { CreateAgentFlowProvider } from "../context/CreateAgentFlowContext";
import { PaymentSuccessHandler } from "./subscription/PaymentSuccessHandler";
import { TrialExpiredModal } from "./subscription/TrialExpiredModal";
import { useSubscription } from "../subscription/useSubscription";
import { BotIcon, PlusIcon, UserIcon } from "./Icons";

export function Layout() {
  const { requireAuth, refreshSession, session, isAuthenticated } = useAuth();
  const { isActive } = useSubscription();
  const { theme } = useTheme();
  const { t } = useI18n();
  const logoSrc = theme === "dark" ? "/icon-dark.png" : "/icon.png";
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLButtonElement>(null);

  const openAccountMenu = () => {
    if (isAuthenticated && session?.pulseToken) {
      setMenuOpen(true);
      void refreshSession();
      return;
    }
    void (async () => {
      const loggedIn = await refreshSession();
      if (loggedIn) {
        setMenuOpen(true);
        return;
      }
      await requireAuth(
        () => {
          setMenuOpen(true);
        },
        {
          modalTitle: t("auth.accountModalTitle"),
          modalSubtitle: t("auth.accountModalSub"),
        },
      );
    })();
  };

  const initial =
    session?.user?.name?.charAt(0) ??
    session?.user?.email?.charAt(0) ??
    null;

  return (
    <div className="app">
      <header className="header">
        <NavLink to="/" className="logo" aria-label={t("nav.logoHome")}>
          <img
            src={logoSrc}
            alt=""
            className="logo__icon"
            width={40}
            height={40}
          />
          <span className="logo__mark">Agentify</span>
          {isAuthenticated && isActive ? (
            <span className="header__pro-badge">{t("subscription.planPro")}</span>
          ) : null}
        </NavLink>

        <nav className="nav" aria-label={t("aria.mainNav")}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            <PlusIcon />
            {t("tab.create")}
          </NavLink>
          <NavLink
            to="/agents"
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            <BotIcon />
            {t("tab.myAgents")}
          </NavLink>
        </nav>

        <div className="header__actions">
          <ThemeToggle />
          <div className="header__profile-wrap">
            <button
              ref={profileRef}
              type="button"
              className="profile-button"
              onClick={openAccountMenu}
              aria-label={t("create.accountA11y")}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {session?.user?.picture ? (
                <img
                  src={session.user.picture}
                  alt=""
                  className="profile-button__img"
                  width={32}
                  height={32}
                />
              ) : isAuthenticated && initial ? (
                <span className="profile-button__letter" aria-hidden>
                  {initial}
                </span>
              ) : (
                <UserIcon className="profile-button__icon" />
              )}
            </button>
            <AccountMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              anchorRef={profileRef}
            />
          </div>
        </div>
      </header>

      <main className="main">
        <CreateAgentFlowProvider>
          <Outlet />
        </CreateAgentFlowProvider>
      </main>

      <div className="gradient-footer" aria-hidden />
      <PaymentSuccessHandler />
      <TrialExpiredModal />
    </div>
  );
}
