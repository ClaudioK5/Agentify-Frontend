import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pulsePath = path.resolve(__dirname, "../../pulse/i18n/strings.ts");
const src = fs.readFileSync(pulsePath, "utf8");

const keyMatch = src.match(/export type AppStringKey =\s*([\s\S]*?);\s*\n\nconst en/);
if (!keyMatch) throw new Error("no keys");

const allKeys = [...keyMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const webKeys = allKeys.filter(
  (k) =>
    k.startsWith("settings.") ||
    k.startsWith("menu.") ||
    k.startsWith("account.") ||
    k.startsWith("auth.") ||
    k.startsWith("tab.") ||
    k.startsWith("create.") ||
    k.startsWith("createResult.") ||
    k.startsWith("loading.") ||
    k.startsWith("success.") ||
    k.startsWith("error.") ||
    k.startsWith("myAgents.") ||
    k === "create.accountA11y",
);

const extraKeys = [
  "nav.logoHome",
  "auth.errorGoogleClientId",
  "auth.errorPulseUrl",
  "auth.errorPulseSave",
  "auth.errorGoogleFailed",
  "auth.errorGoogleCancelled",
  "auth.errorGoogleNotConfigured",
  "create.creating",
  "create.learnOptionsAria",
  "create.funOptionsAria",
  "create.newsOptionsAria",
  "create.agentDescriptionLabel",
  "myAgents.refresh",
  "myAgents.refreshing",
  "myAgents.loading",
  "myAgents.createFirst",
  "myAgents.deleteConfirm",
  "myAgents.runSuccess",
  "myAgents.runFailed",
  "myAgents.deleteFailed",
  "myAgents.loadFailed",
  "myAgents.noEmail",
  "aria.theme",
  "aria.themeDay",
  "aria.themeNight",
  "aria.language",
  "aria.mainNav",
  "aria.loading",
];

const keys = [...new Set([...webKeys, ...extraKeys])].sort();

function extractLocale(name) {
  const re = new RegExp(
    `const ${name}: Record<AppStringKey, string> = \\{([\\s\\S]*?)\\n\\};`,
  );
  const m = src.match(re);
  if (!m) throw new Error(`locale ${name}`);
  const body = m[1];
  const map = {};
  const entryRe = /"([^"]+)":\s*(?:\n\s*)?"((?:[^"\\]|\\.)*)"/g;
  let em;
  while ((em = entryRe.exec(body))) {
    map[em[1]] = em[2].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return map;
}

const extras = {
  en: {
    "nav.logoHome": "Agentify home",
    "auth.errorGoogleClientId":
      "Set VITE_GOOGLE_WEB_CLIENT_ID in .env (same Web client ID as mobile).",
    "auth.errorPulseUrl": "Set VITE_PULSE_API_URL in .env (Pulse API base URL).",
    "auth.errorPulseSave":
      "Google sign-in worked, but the Pulse server could not save your profile: {message}",
    "auth.errorGoogleFailed": "Google sign-in failed. Please try again.",
    "auth.errorGoogleCancelled": "Google sign-in was cancelled or failed.",
    "auth.errorGoogleNotConfigured":
      "Google client ID is not configured. Set VITE_GOOGLE_WEB_CLIENT_ID.",
    "create.creating": "Creating…",
    "create.learnOptionsAria": "Learn options",
    "create.funOptionsAria": "Fun options",
    "create.newsOptionsAria": "News options",
    "create.agentDescriptionLabel": "Agent description",
    "myAgents.refresh": "Refresh",
    "myAgents.refreshing": "Refreshing…",
    "myAgents.loading": "Loading agents…",
    "myAgents.createFirst": "Create your first agent",
    "myAgents.deleteConfirm": "Delete workflow {id}?",
    "myAgents.runSuccess": "Your AI agent was triggered successfully.",
    "myAgents.runFailed": "Run failed: {message}",
    "myAgents.deleteFailed": "Delete failed: {message}",
    "myAgents.loadFailed": "Could not load agents right now.",
    "myAgents.noEmail": "No signed-in email found. Please sign in again.",
    "aria.theme": "Theme",
    "aria.themeDay": "Day mode",
    "aria.themeNight": "Dark mode",
    "aria.language": "Language",
    "aria.mainNav": "Main",
    "aria.loading": "Loading",
  },
  ru: {
    "nav.logoHome": "Главная Agentify",
    "auth.errorGoogleClientId":
      "Укажите VITE_GOOGLE_WEB_CLIENT_ID в .env (тот же Web client ID, что в мобильном приложении).",
    "auth.errorPulseUrl": "Укажите VITE_PULSE_API_URL в .env (базовый URL Pulse API).",
    "auth.errorPulseSave":
      "Вход через Google выполнен, но Pulse не смог сохранить профиль: {message}",
    "auth.errorGoogleFailed": "Не удалось войти через Google. Попробуйте снова.",
    "auth.errorGoogleCancelled": "Вход через Google отменён или не удался.",
    "auth.errorGoogleNotConfigured":
      "Google client ID не настроен. Укажите VITE_GOOGLE_WEB_CLIENT_ID.",
    "create.creating": "Создание…",
    "create.learnOptionsAria": "Варианты «Учёба»",
    "create.funOptionsAria": "Варианты «Развлечения»",
    "create.newsOptionsAria": "Варианты «Новости»",
    "create.agentDescriptionLabel": "Описание агента",
    "myAgents.refresh": "Обновить",
    "myAgents.refreshing": "Обновление…",
    "myAgents.loading": "Загрузка агентов…",
    "myAgents.createFirst": "Создать первого агента",
    "myAgents.deleteConfirm": "Удалить workflow {id}?",
    "myAgents.runSuccess": "AI-агент успешно запущен.",
    "myAgents.runFailed": "Ошибка запуска: {message}",
    "myAgents.deleteFailed": "Ошибка удаления: {message}",
    "myAgents.loadFailed": "Не удалось загрузить агентов.",
    "myAgents.noEmail": "Email не найден. Войдите снова.",
    "aria.theme": "Тема",
    "aria.themeDay": "Светлая тема",
    "aria.themeNight": "Тёмная тема",
    "aria.language": "Язык",
    "aria.mainNav": "Главная навигация",
    "aria.loading": "Загрузка",
  },
  it: {
    "nav.logoHome": "Home Agentify",
    "auth.errorGoogleClientId":
      "Imposta VITE_GOOGLE_WEB_CLIENT_ID in .env (stesso Web client ID dell'app mobile).",
    "auth.errorPulseUrl": "Imposta VITE_PULSE_API_URL in .env (URL base Pulse API).",
    "auth.errorPulseSave":
      "Accesso Google riuscito, ma Pulse non ha potuto salvare il profilo: {message}",
    "auth.errorGoogleFailed": "Accesso Google non riuscito. Riprova.",
    "auth.errorGoogleCancelled": "Accesso Google annullato o non riuscito.",
    "auth.errorGoogleNotConfigured":
      "Google client ID non configurato. Imposta VITE_GOOGLE_WEB_CLIENT_ID.",
    "create.creating": "Creazione…",
    "create.learnOptionsAria": "Opzioni Impara",
    "create.funOptionsAria": "Opzioni Divertimento",
    "create.newsOptionsAria": "Opzioni Notizie",
    "create.agentDescriptionLabel": "Descrizione agente",
    "myAgents.refresh": "Aggiorna",
    "myAgents.refreshing": "Aggiornamento…",
    "myAgents.loading": "Caricamento agenti…",
    "myAgents.createFirst": "Crea il tuo primo agente",
    "myAgents.deleteConfirm": "Eliminare workflow {id}?",
    "myAgents.runSuccess": "Il tuo agente AI è stato avviato.",
    "myAgents.runFailed": "Esecuzione non riuscita: {message}",
    "myAgents.deleteFailed": "Eliminazione non riuscita: {message}",
    "myAgents.loadFailed": "Impossibile caricare gli agenti.",
    "myAgents.noEmail": "Email non trovata. Accedi di nuovo.",
    "aria.theme": "Tema",
    "aria.themeDay": "Modalità chiara",
    "aria.themeNight": "Modalità scura",
    "aria.language": "Lingua",
    "aria.mainNav": "Navigazione principale",
    "aria.loading": "Caricamento",
  },
};

const outDir = path.resolve(__dirname, "../src/i18n/strings");
fs.mkdirSync(outDir, { recursive: true });

for (const loc of ["en", "ru", "it"]) {
  const map = { ...extractLocale(loc), ...extras[loc] };
  const lines = keys.map((k) => {
    const v = map[k] ?? extras.en[k] ?? k;
    const esc = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `  "${k}": "${esc}",`;
  });
  const out = `import type { StringPack } from "./types";\n\nexport const ${loc}: StringPack = {\n${lines.join("\n")}\n};\n`;
  fs.writeFileSync(path.join(outDir, `${loc}.ts`), out);
}

const typeKeys = keys.map((k) => `  | "${k}"`).join("\n");
fs.writeFileSync(
  path.join(outDir, "types.ts"),
  `export type AppStringKey =\n${typeKeys};\n\nexport type StringPack = Record<AppStringKey, string>;\n`,
);
fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `import type { AppLocale } from "../types";\nimport { en } from "./en";\nimport { ru } from "./ru";\nimport { it } from "./it";\nexport type { AppStringKey } from "./types";\nexport const STRINGS: Record<AppLocale, import("./types").StringPack> = { en, ru, it };\n`,
);

// Fix Agentify in settings.sub for ru/it
for (const file of ["ru.ts", "it.ts"]) {
  let c = fs.readFileSync(path.join(outDir, file), "utf8");
  c = c.replace(/MyAgent/g, "Agentify");
  fs.writeFileSync(path.join(outDir, file), c);
}

let enFile = fs.readFileSync(path.join(outDir, "en.ts"), "utf8");
enFile = enFile.replace(/MyAgent/g, "Agentify");
fs.writeFileSync(path.join(outDir, "en.ts"), enFile);

console.log("Generated", keys.length, "keys");
