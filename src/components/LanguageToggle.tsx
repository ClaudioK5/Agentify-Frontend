import { useI18n } from "../i18n/I18nProvider";
import { APP_LOCALES, type AppLocale } from "../i18n/types";

const SEGMENT_LABEL: Record<AppLocale, string> = {
  en: "EN",
  ru: "RU",
  it: "IT",
};

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="segment-toggle" role="radiogroup" aria-label={t("aria.language")}>
      {APP_LOCALES.map((code) => {
        const selected = locale === code;
        return (
          <button
            key={code}
            type="button"
            className={`segment-toggle__btn ${selected ? "segment-toggle__btn--active" : ""}`}
            onClick={() => setLocale(code)}
            aria-pressed={selected}
          >
            {SEGMENT_LABEL[code]}
          </button>
        );
      })}
    </div>
  );
}
