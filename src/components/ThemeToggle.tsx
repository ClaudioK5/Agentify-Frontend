import { useTheme } from "../context/ThemeContext";
import { useI18n } from "../i18n/I18nProvider";
import { SunIcon, MoonIcon } from "./Icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="theme-toggle" role="group" aria-label={t("aria.theme")}>
      <button
        type="button"
        className={`theme-toggle__btn ${theme === "light" ? "theme-toggle__btn--active" : ""}`}
        onClick={() => setTheme("light")}
        aria-label={t("aria.themeDay")}
        aria-pressed={theme === "light"}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={`theme-toggle__btn ${theme === "dark" ? "theme-toggle__btn--active" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label={t("aria.themeNight")}
        aria-pressed={theme === "dark"}
      >
        <MoonIcon />
      </button>
    </div>
  );
}
