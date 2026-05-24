import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppLocale } from "./types";
import { APP_LOCALES } from "./types";
import type { AppStringKey } from "./strings";
import { STRINGS } from "./strings";

const STORAGE_KEY = "pulse_app_locale_v1";

type TParams = Record<string, string | number>;

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  t: (key: AppStringKey, params?: TParams) => string;
  ready: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(raw: string | null): AppLocale {
  if (raw && APP_LOCALES.includes(raw as AppLocale)) return raw as AppLocale;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    try {
      return normalizeLocale(localStorage.getItem(STORAGE_KEY));
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    const pageTitle =
      STRINGS[locale]["create.title"] ?? STRINGS.en["create.title"];
    document.title = `Agentify — ${pageTitle}`;
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const t = useCallback(
    (key: AppStringKey, params?: TParams) => {
      let s = STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          s = s.split(`{${name}}`).join(String(value));
        }
      }
      return s;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, ready: true }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
