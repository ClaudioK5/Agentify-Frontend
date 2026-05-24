import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useI18n } from "../i18n/I18nProvider";

type AccountMenuProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export function AccountMenu({ open, onClose, anchorRef }: AccountMenuProps) {
  const { signOut, requireAuth, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const goAccount = () => {
    onClose();
    if (isAuthenticated) {
      navigate("/account");
      return;
    }
    void requireAuth(
      () => {
        navigate("/account");
      },
      {
        modalTitle: t("auth.accountModalTitle"),
        modalSubtitle: t("auth.accountModalSub"),
      },
    );
  };

  const goSettings = () => {
    onClose();
    navigate("/settings");
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <div ref={menuRef} className="account-menu" role="menu">
      <button
        type="button"
        className="account-menu__item"
        role="menuitem"
        onClick={goAccount}
      >
        {t("menu.account")}
      </button>
      <button
        type="button"
        className="account-menu__item"
        role="menuitem"
        onClick={goSettings}
      >
        {t("menu.settings")}
      </button>
      <div className="account-menu__divider" role="separator" />
      <button
        type="button"
        className="account-menu__item account-menu__item--danger"
        role="menuitem"
        onClick={() => void handleSignOut()}
      >
        {t("menu.signOut")}
      </button>
    </div>
  );
}
