// Pure helper module for the Custom Assessment Builder.
// All functions are pure: they never mutate their inputs.

export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;

export type SubtopicSource = "ai" | "custom";

export interface SubtopicItem {
  name: string;
  selected: boolean;
  questionCount: number;
  source: SubtopicSource;
}

/**
 * Trim and collapse internal whitespace to single spaces.
 * Empty/whitespace-only input returns "".
 */
export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * True when the name is non-empty after normalization.
 */
export function isValidName(raw: string): boolean {
  return normalizeName(raw).length > 0;
}

/**
 * Round to the nearest integer and clamp into [MIN_QUESTIONS, MAX_QUESTIONS].
 * Non-finite values (NaN, Infinity, -Infinity) return MIN_QUESTIONS.
 */
export function clampQuestionCount(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_QUESTIONS;
  }
  const rounded = Math.round(value);
  if (rounded < MIN_QUESTIONS) {
    return MIN_QUESTIONS;
  }
  if (rounded > MAX_QUESTIONS) {
    return MAX_QUESTIONS;
  }
  return rounded;
}

/**
 * Add a name to the list if not already present (case-insensitive, normalized).
 * Returns the original list unchanged when the name is invalid or already
 * exists; otherwise returns a new list with one appended item.
 */
export function addSubtopic(
  list: SubtopicItem[],
  name: string,
  source: SubtopicSource,
): SubtopicItem[] {
  if (!isValidName(name)) {
    return list;
  }
  const normalized = normalizeName(name);
  const key = normalized.toLowerCase();
  const exists = list.some(
    (item) => normalizeName(item.name).toLowerCase() === key,
  );
  if (exists) {
    return list;
  }
  return [
    ...list,
    {
      name: normalized,
      selected: false,
      questionCount: MIN_QUESTIONS,
      source,
    },
  ];
}

/**
 * Merge a batch of AI-suggested names, deduplicating against the existing list
 * and within the batch itself.
 */
export function mergeSuggestions(
  list: SubtopicItem[],
  names: string[],
): SubtopicItem[] {
  return names.reduce(
    (acc, name) => addSubtopic(acc, name, "ai"),
    list,
  );
}

/**
 * Build the generate-test mapping from selected subtopics only.
 * Keys are the names of selected subtopics; values are the clamped counts.
 */
export function buildSubtopicCountMap(
  list: SubtopicItem[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of list) {
    if (item.selected) {
      map[item.name] = clampQuestionCount(item.questionCount);
    }
  }
  return map;
}

/**
 * Number of committed selected subtopics.
 */
export function selectedCount(list: SubtopicItem[]): number {
  return list.reduce((count, item) => (item.selected ? count + 1 : count), 0);
}
