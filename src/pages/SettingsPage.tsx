import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageToggle } from "../components/LanguageToggle";
import { useI18n } from "../i18n/I18nProvider";

export function SettingsPage() {
  const { t } = useI18n();

  return (
    <section className="settings-page">
      <h1 className="settings-page__title">{t("settings.title")}</h1>
      <p className="settings-page__sub">{t("settings.sub")}</p>

      <div className="settings-row">
        <div className="settings-row__text">
          <p className="settings-row__title">{t("settings.theme")}</p>
          <p className="settings-row__sub">{t("settings.themeSub")}</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="settings-row">
        <div className="settings-row__text">
          <p className="settings-row__title">{t("settings.language")}</p>
          <p className="settings-row__sub">{t("settings.languageSub")}</p>
        </div>
        <LanguageToggle />
      </div>
    </section>
  );
}
