import type { ParsedSignal } from "@/Utils/types/JDGenerator";
import type { Difficulty } from "@/Utils/builder/difficulty";

// Maps a confirmed JD signal onto the existing custom test-attempt context
// ({ topic, subtopics, difficulty }) so a JD becomes an attemptable test
// through the unchanged custom flow (BuilderPage -> /test/attempt/custom).

const SENIORITY_DIFFICULTY: Record<string, Difficulty> = {
  intern: "easy",
  junior: "easy",
  mid: "medium",
  senior: "hard",
  lead: "hard",
};

const QUESTIONS_PER_SKILL = "3";
// ponytail: cap skills so a JD with 30 skills doesn't spawn a 90-question test.
const MAX_SKILLS = 8;

export interface AttemptContext {
  topic: string;
  subtopics: Record<string, string>;
  difficulty: Difficulty;
}

/** Turn the confirmed hiring signal into a custom-attempt context. */
export function jdSignalToAttempt(signal: ParsedSignal): AttemptContext {
  const seen = new Set<string>();
  const subtopics: Record<string, string> = {};

  for (const skill of [
    ...signal.mustHave,
    ...signal.skills,
    ...signal.niceToHave,
  ]) {
    const name = skill.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    subtopics[name] = QUESTIONS_PER_SKILL;
    if (seen.size >= MAX_SKILLS) break;
  }

  // Fallback: a signal with no usable skills still needs one subtopic, else the
  // attempt flow has nothing to generate from.
  if (Object.keys(subtopics).length === 0) {
    subtopics[signal.role || "General"] = "5";
  }

  return {
    topic: signal.role || "Assessment",
    subtopics,
    difficulty: SENIORITY_DIFFICULTY[signal.seniority] ?? "medium",
  };
}
