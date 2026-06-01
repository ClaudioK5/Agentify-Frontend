export type PromptChipId = "learn" | "fun" | "alerts";

export type AppLocale = "en" | "ru" | "it";

const en: Record<PromptChipId, readonly string[]> = {
  learn: [
    "Create an agent that creates daily quizzes to help me prepare for [subject], including solutions (ask the AI to return a premium HTML for the email), and delivers it via Email.",
    "Create an agent that prepares me for a [job role] interview. He makes daily questions and tasks, including answers, with AI (ask the AI to return a premium HTML for the email), and delivers it via Email.",
    "Create an agent that creates a daily exercise to improve my [skill], with explanations and solutions with AI (ask the AI to return a premium HTML for the email), and delivers it via Email.",
  ],
  fun: [
    "Create an agent that makes a daily [name of the mini-game] (also there should be the answer down below) with AI (ask the AI to return a premium HTML for the email, and don't use buttons) and delivers it via Email.",
    "Create an AI agent that generates and sends me a short story every day about [topic] via Email (ask the AI to return a clear and nice HTML for the email).",
    "Create an agent that creates a daily fact about [topic] with a short explanation (ask the AI to return a clear and nice HTML for the email), and delivers it via Email.",
  ],
  alerts: [
    "Create an AI agent that notifies me via Email when [the event that interests you happens]. In order to do that, the agent should fetch the latest related news, limit them to 15 articles, extract the content from the news fetched, aggregate them all and send them to AI (mention in the prompt given to the AI that these are the only latest related news for that event from Google News) to check if it happens: Yes (with the link and explanation) or No with explanation (if nothing changed and/or irrelevant news, therefore nothing changed) or Error with the data in the prompt (only in case of corrupted or missing data) (ask the AI to return a premium HTML for the email). The result from AI is delivered via Email whatever it is.",
    "Create an agent that fetches the latest news about [topic], limit them to only 15 articles, extracts the content from the news fetched, aggregates them all and makes me a general summary (ask the AI to return a premium HTML for the email) with AI that is delivered via Email.",
  ],
};

const ru: Record<PromptChipId, readonly string[]> = {
  learn: [
    "Создай агента, который ежедневно создаёт тесты, чтобы помочь мне подготовиться к [предмету], включая решения (попроси ИИ вернуть premium HTML для email), и доставляет их по Email.",
    "Создай агента, который готовит меня к собеседованию на [роль]. Он ежедневно создаёт вопросы и задания, включая ответы, с помощью ИИ (попроси ИИ вернуть premium HTML для email), и доставляет их по Email.",
    "Создай агента, который ежедневно создаёт упражнение для улучшения [навыка], с объяснениями и решениями с помощью ИИ (попроси ИИ вернуть premium HTML для email), и доставляет его по Email.",
  ],
  fun: [
    "Создай агента, который ежедневно делает [название мини-игры] (ответ также должен быть внизу) с помощью ИИ (попроси ИИ вернуть premium HTML для email и не используй кнопки) и доставляет это по Email.",
    "Создай AI-агента, который каждый день генерирует и присылает короткий рассказ на тему [тема] по Email (ask the AI to return a clear and nice HTML for the email).",
    "Создай агента, который ежедневно создаёт факт о [тема] с кратким пояснением (попроси ИИ вернуть понятный и красивый HTML для email), и доставляет это по Email.",
  ],
  alerts: [
    "Создай AI-агента, который уведомляет меня по Email, когда [происходит событие, которое тебя интересует]. Для этого агент должен получить последние связанные новости, ограничить их 15 статьями, извлечь содержимое из полученных новостей, объединить их и передать ИИ (в промпте для ИИ укажи, что это только последние связанные новости об этом событии из Google News), чтобы проверить, произошло ли это: Да (со ссылкой и пояснением) или Нет с пояснением (если ничего не изменилось и/или новости нерелевантны, значит без изменений) или Ошибка с данными из промпта (только при повреждённых или отсутствующих данных) (попроси ИИ вернуть premium HTML для email). Результат от ИИ доставляется по Email в любом случае.",
    "Создай агента, который получает последние новости о [тема], ограничивает их только 15 статьями, извлекает содержимое из полученных новостей, объединяет их и с помощью ИИ формирует общую сводку (попроси ИИ вернуть premium HTML для email), которая доставляется по Email.",
  ],
};

const it: Record<PromptChipId, readonly string[]> = {
  learn: [
    "Crea un agente che crea quiz giornalieri per aiutarmi a prepararmi per [materia], incluse le soluzioni (chiedi all'IA di restituire un premium HTML per l'email), e li consegna via Email.",
    "Crea un agente che mi prepara per un colloquio da [ruolo]. Ogni giorno crea domande e compiti, incluse le risposte, con l'IA (chiedi all'IA di restituire un premium HTML per l'email), e li consegna via Email.",
    "Crea un agente che crea un esercizio giornaliero per migliorare [abilità], con spiegazioni e soluzioni con l'IA (chiedi all'IA di restituire un premium HTML per l'email), e lo consegna via Email.",
  ],
  fun: [
    "Crea un agente che ogni giorno crea [nome del mini-gioco] (la risposta deve essere anche in basso) con l'IA (chiedi all'IA di restituire un premium HTML per l'email e di non usare pulsanti) e lo consegna via Email.",
    "Crea un agente AI che genera e mi invia ogni giorno un racconto breve su [argomento] via Email (ask the AI to return a clear and nice HTML for the email).",
    "Crea un agente che crea ogni giorno un fatto su [argomento] con una breve spiegazione (chiedi all'IA di restituire un HTML chiaro e gradevole per l'email), e lo consegna via Email.",
  ],
  alerts: [
    "Crea un agente AI che mi avvisa via Email quando [si verifica l'evento che ti interessa]. Per farlo, l'agente deve recuperare le ultime notizie correlate, limitarle a 15 articoli, estrarre il contenuto dalle notizie recuperate, aggregarle tutte e inviarle all'IA (nel prompt all'IA indica che queste sono le sole ultime notizie correlate a quell'evento da Google News) per verificare se si è verificato: Sì (con link e spiegazione) oppure No con spiegazione (se non è cambiato nulla e/o le notizie sono irrilevanti, quindi nessun cambiamento) oppure Errore con i dati nel prompt (solo in caso di dati corrotti o mancanti) (chiedi all'IA di restituire un premium HTML per l'email). Il risultato dell'IA viene consegnato via Email qualunque sia.",
    "Crea un agente che recupera le ultime notizie su [argomento], le limita a soli 15 articoli, estrae il contenuto dalle notizie recuperate, le aggrega tutte e mi produce un riepilogo generale (chiedi all'IA di restituire un premium HTML per l'email) con l'IA che viene inviato via Email.",
  ],
};

const byLocale: Record<AppLocale, Record<PromptChipId, readonly string[]>> = {
  en,
  ru,
  it,
};

export function getPromptTemplates(
  locale: AppLocale = "en",
): Record<PromptChipId, readonly string[]> {
  return byLocale[locale] ?? en;
}
