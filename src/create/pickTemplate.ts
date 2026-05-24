import type { PromptChipId } from "../i18n/promptTemplates";

export function pickTemplateForCategory(
  id: PromptChipId,
  currentText: string,
  templates: Record<PromptChipId, readonly string[]>,
): string {
  const pool = templates[id];
  const alternatives = pool.filter((line) => line !== currentText);
  const choices = alternatives.length > 0 ? alternatives : pool;
  return choices[Math.floor(Math.random() * choices.length)]!;
}
