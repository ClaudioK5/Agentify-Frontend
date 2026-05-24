export type LearnOptionId = "interview" | "quiz" | "exercise";
export type FunOptionId = "riddles" | "facts";
export type NewsOptionId = "briefing" | "tracker";

export const LEARN_OPTIONS: readonly {
  id: LearnOptionId;
  emoji: string;
  templateIndex: number;
}[] = [
  { id: "interview", emoji: "🎯", templateIndex: 1 },
  { id: "quiz", emoji: "🧠", templateIndex: 0 },
  { id: "exercise", emoji: "💪", templateIndex: 2 },
];

export const FUN_OPTIONS: readonly {
  id: FunOptionId;
  emoji: string;
  templateIndex: number;
}[] = [
  { id: "riddles", emoji: "🧩", templateIndex: 0 },
  { id: "facts", emoji: "💡", templateIndex: 2 },
];

export const NEWS_OPTIONS: readonly {
  id: NewsOptionId;
  emoji: string;
  templateIndex: number;
}[] = [
  { id: "briefing", emoji: "📰", templateIndex: 1 },
  { id: "tracker", emoji: "📡", templateIndex: 0 },
];
