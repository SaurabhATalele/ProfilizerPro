// Pure helper module for persisting/reconstructing custom assessments.
// All functions are pure: they never mutate their inputs.

import {
  SubtopicItem,
  clampQuestionCount,
} from "@/Utils/builder/subtopics";
import { Difficulty, normalizeDifficulty } from "@/Utils/builder/difficulty";

export interface CustomSubtopic {
  name: string;
  questionCount: number;
}

export interface AttemptRecord {
  email: string;
  score: number; // percentage
  correct: number;
  total: number;
  questions: Array<{ question: string; answer: string; yourAnswer: string }>;
  date: Date;
}

export interface CustomAssignmentRecord {
  name: string;
  isCustom: true;
  owner: string;
  difficulty: Difficulty;
  topic: string;
  customSubtopics: CustomSubtopic[];
  attemptedBy: AttemptRecord[];
}

export interface BuildRecordInput {
  owner: string;
  topic: string;
  subtopics: SubtopicItem[];
  difficulty?: string;
  attempt: AttemptRecord;
}

/**
 * Build a new custom-assignment record from builder state + one attempt.
 * - name/topic from the trimmed topic
 * - customSubtopics = exactly the SELECTED subtopics with clamped counts
 * - difficulty normalized via normalizeDifficulty
 * - attemptedBy = [attempt]
 */
export function buildCustomAssignmentRecord(
  input: BuildRecordInput,
): CustomAssignmentRecord {
  const topic = input.topic.trim();
  const customSubtopics: CustomSubtopic[] = input.subtopics
    .filter((s) => s.selected)
    .map((s) => ({
      name: s.name,
      questionCount: clampQuestionCount(s.questionCount),
    }));

  return {
    name: topic,
    isCustom: true,
    owner: input.owner,
    difficulty: normalizeDifficulty(input.difficulty),
    topic,
    customSubtopics,
    attemptedBy: [input.attempt],
  };
}

/**
 * Reconstruct builder state from a stored record for re-customization.
 * Round-trips with buildCustomAssignmentRecord for
 * topic/selected-subtopics/counts/difficulty.
 */
export function prefillFromRecord(record: {
  topic: string;
  customSubtopics: CustomSubtopic[];
  difficulty?: string;
}): { topic: string; subtopics: SubtopicItem[]; difficulty: Difficulty } {
  const subtopics: SubtopicItem[] = record.customSubtopics.map((s) => ({
    name: s.name,
    selected: true,
    questionCount: clampQuestionCount(s.questionCount),
    source: "custom",
  }));

  return {
    topic: record.topic,
    subtopics,
    difficulty: normalizeDifficulty(record.difficulty),
  };
}

/**
 * Decide whether a submitted custom attempt creates a new record or appends to
 * an existing one. Returns "append" iff a non-empty existing id is carried.
 */
export function decidePersistence(
  existingId?: string | null,
): "append" | "create" {
  if (typeof existingId === "string" && existingId.trim().length > 0) {
    return "append";
  }
  return "create";
}

/**
 * General-listing visibility filter: drop every record flagged isCustom === true,
 * retain records that are not custom (isCustom false/missing), preserving order.
 */
export function filterGeneralListing<T extends { isCustom?: boolean }>(
  assignments: T[],
): T[] {
  return assignments.filter((a) => a.isCustom !== true);
}
