export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export const DEFAULT_DIFFICULTY: Difficulty = "medium";

export function normalizeDifficulty(raw?: string | null): Difficulty {
  if (typeof raw !== "string") return DEFAULT_DIFFICULTY;
  const v = raw.trim().toLowerCase();
  return (DIFFICULTIES as readonly string[]).includes(v)
    ? (v as Difficulty)
    : DEFAULT_DIFFICULTY;
}
