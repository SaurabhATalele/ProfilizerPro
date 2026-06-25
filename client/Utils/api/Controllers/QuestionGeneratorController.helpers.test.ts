import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  composeGenerationPayload,
  isValidTargetDifficulty,
  validateGeneratedSet,
  enforceSkillTagMembership,
  reconcileMix,
  capToRequestedMix,
  computeShortfall,
  countByKind,
  jdHash,
  type GenerationPayloadEdits,
} from "@/Utils/api/Controllers/QuestionGeneratorController";
import { GeneratedSetSchema } from "@/Utils/validation/jdGeneratorSchemas";
import type {
  Mix,
  ParsedSignal,
  QuestionKind,
  Seniority,
} from "@/Utils/types/JDGenerator";

// Property tests for the pure helpers in QuestionGeneratorController. No DB and
// no LLM are involved here — these helpers are pure. Each property runs a
// minimum of 100 iterations.

const RUNS = { numRuns: 100 } as const;

const KINDS: readonly QuestionKind[] = ["mcq", "coding", "aptitude"];
const SENIORITIES: readonly Seniority[] = [
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
];

const seniorityArb = fc.constantFrom<Seniority>(...SENIORITIES);
const questionDifficultyArb = fc.constantFrom("easy", "medium", "hard");
const targetDifficultyArb = fc.constantFrom("easy", "medium", "hard", "mixed");
const kindArb = fc.constantFrom<QuestionKind>(...KINDS);

// Small skill pool so removals / additions / membership checks actually
// overlap rather than (almost) always missing.
const skillArb = fc.constantFrom("a", "b", "c", "d", "e", "f");

const parsedSignalArb: fc.Arbitrary<ParsedSignal> = fc.record({
  role: fc.string(),
  seniority: seniorityArb,
  skills: fc.uniqueArray(skillArb),
  mustHave: fc.uniqueArray(skillArb),
  niceToHave: fc.uniqueArray(skillArb),
});

const testCaseArb = fc.record({
  input: fc.string(),
  expectedOutput: fc.string(),
  hidden: fc.boolean(),
});

const mixArb: fc.Arbitrary<Mix> = fc.record({
  mcq: fc.nat({ max: 10 }),
  coding: fc.nat({ max: 10 }),
  aptitude: fc.nat({ max: 10 }),
});

describe("composeGenerationPayload", () => {
  it("Property 5: skills = parsed - removed + added (deduped); carries edited role/seniority", () => {
    // Feature: jd-question-generator, Property 5: Generation payload composition
    fc.assert(
      fc.property(
        parsedSignalArb,
        fc.array(skillArb),
        fc.array(skillArb),
        fc.option(fc.string(), { nil: undefined }),
        fc.option(seniorityArb, { nil: undefined }),
        (parsed, removedSkills, addedSkills, role, seniority) => {
          const edits: GenerationPayloadEdits = {
            removedSkills,
            addedSkills,
            role,
            seniority,
          };
          const out = composeGenerationPayload(parsed, edits);

          // Expected skill set: parsed - removed, then + added (de-duped,
          // order preserved).
          const removedSet = new Set(removedSkills);
          const kept = parsed.skills.filter((s) => !removedSet.has(s));
          const seen = new Set(kept);
          const expected = [...kept];
          for (const a of addedSkills) {
            if (!seen.has(a)) {
              seen.add(a);
              expected.push(a);
            }
          }

          expect(out.skills).toEqual(expected);
          // No duplicates in the resulting skills.
          expect(new Set(out.skills).size).toBe(out.skills.length);
          // Removed skills that were not re-added are gone.
          for (const r of removedSkills) {
            if (!addedSkills.includes(r)) {
              expect(out.skills).not.toContain(r);
            }
          }
          // Edited role / seniority carried through (or fall back to parsed).
          expect(out.role).toBe(role ?? parsed.role);
          expect(out.seniority).toBe(seniority ?? parsed.seniority);
          // mustHave / niceToHave carried through unchanged.
          expect(out.mustHave).toEqual(parsed.mustHave);
          expect(out.niceToHave).toEqual(parsed.niceToHave);
        },
      ),
      RUNS,
    );
  });
});

describe("isValidTargetDifficulty", () => {
  it("Property 6: accepts iff value is one of easy|medium|hard|mixed", () => {
    // Feature: jd-question-generator, Property 6: Target difficulty enum
    fc.assert(
      fc.property(
        fc.oneof(targetDifficultyArb, fc.anything()),
        (value) => {
          const expected =
            typeof value === "string" &&
            ["easy", "medium", "hard", "mixed"].includes(value);
          expect(isValidTargetDifficulty(value)).toBe(expected);
        },
      ),
      RUNS,
    );
  });
});

// Candidate (possibly-invalid) question/set arbitraries — used to exercise both
// the accepting and rejecting branches of validateGeneratedSet.
const candidateQuestionArb = fc.oneof(
  fc.record({
    kind: fc.constant("mcq"),
    text: fc.string({ minLength: 1 }),
    difficulty: questionDifficultyArb,
  }),
  fc.record({
    kind: fc.constant("aptitude"),
    text: fc.string({ minLength: 1 }),
    difficulty: questionDifficultyArb,
  }),
  fc.record({
    kind: fc.constant("coding"),
    text: fc.string({ minLength: 1 }),
    difficulty: questionDifficultyArb,
    testCases: fc.array(testCaseArb, { maxLength: 6 }),
  }),
);

const candidateSetArb = fc.record({
  difficulty: targetDifficultyArb,
  questions: fc.array(candidateQuestionArb, { maxLength: 8 }),
});

describe("validateGeneratedSet", () => {
  it("Property 7: ok iff schema-valid (matches GeneratedSetSchema)", () => {
    // Feature: jd-question-generator, Property 7: Generation output validation with no partial persistence
    fc.assert(
      fc.property(fc.oneof(candidateSetArb, fc.anything()), (candidate) => {
        const expected = GeneratedSetSchema.safeParse(candidate).success;
        expect(validateGeneratedSet(candidate).ok).toBe(expected);
      }),
      RUNS,
    );
  });

  it("Property 9: every validated coding question has >=3 test cases, >=1 hidden", () => {
    // Feature: jd-question-generator, Property 9: Coding question test-case invariant
    fc.assert(
      fc.property(candidateSetArb, (candidate) => {
        const res = validateGeneratedSet(candidate);
        if (res.ok) {
          for (const q of res.value.questions) {
            if (q.kind === "coding") {
              expect(q.testCases).toBeDefined();
              expect(q.testCases!.length).toBeGreaterThanOrEqual(3);
              expect(q.testCases!.some((tc) => tc.hidden)).toBe(true);
            }
          }
        }
      }),
      RUNS,
    );
  });
});

describe("enforceSkillTagMembership", () => {
  const questionLiteArb = fc.record({
    kind: kindArb,
    skillTag: fc.option(skillArb, { nil: undefined }),
  });

  it("Property 8: keeps only mcq/coding whose skillTag is in mustHave ∪ niceToHave", () => {
    // Feature: jd-question-generator, Property 8: skillTag membership
    fc.assert(
      fc.property(
        fc.array(questionLiteArb, { maxLength: 12 }),
        fc.array(skillArb),
        (questions, allowedArr) => {
          const allowed = new Set(allowedArr);
          const out = enforceSkillTagMembership(questions, allowed);

          const expected = questions.filter((q) =>
            q.kind === "mcq" || q.kind === "coding"
              ? q.skillTag !== undefined && allowed.has(q.skillTag)
              : true,
          );
          expect(out).toEqual(expected);

          // Every surviving mcq/coding question has an allowed skillTag.
          for (const q of out) {
            if (q.kind === "mcq" || q.kind === "coding") {
              expect(q.skillTag).toBeDefined();
              expect(allowed.has(q.skillTag!)).toBe(true);
            }
          }
        },
      ),
      RUNS,
    );
  });
});

describe("reconcileMix / capToRequestedMix / computeShortfall", () => {
  const questionsArb = fc.array(fc.record({ kind: kindArb }), {
    maxLength: 30,
  });

  it("Property 10: produced <= requested per kind; shortfall = requested - produced", () => {
    // Feature: jd-question-generator, Property 10: Mix shortfall accounting
    fc.assert(
      fc.property(questionsArb, mixArb, (questions, requested) => {
        const { questions: capped, produced, shortfall } = reconcileMix(
          questions,
          requested,
        );

        const available = countByKind(questions);
        for (const kind of KINDS) {
          // Produced never exceeds requested.
          expect(produced[kind]).toBeLessThanOrEqual(requested[kind]);
          // Produced is exactly min(available, requested).
          expect(produced[kind]).toBe(
            Math.min(available[kind], requested[kind]),
          );
          // Shortfall is the (clamped) gap.
          expect(shortfall[kind]).toBe(
            Math.max(0, requested[kind] - produced[kind]),
          );
        }

        // The capped list's per-kind counts equal `produced`.
        expect(countByKind(capped)).toEqual(produced);
        expect(capped.length).toBe(
          produced.mcq + produced.coding + produced.aptitude,
        );

        // Cross-check the standalone helpers agree.
        const directCap = capToRequestedMix(questions, requested);
        expect(countByKind(directCap)).toEqual(produced);
        expect(computeShortfall(requested, produced)).toEqual(shortfall);
      }),
      RUNS,
    );
  });
});

describe("jdHash", () => {
  // Words contain no whitespace so normalization (collapse whitespace,
  // lowercase, trim) is the only transformation differentiating variants.
  const wordArb = fc
    .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789".split("")), {
      minLength: 1,
      maxLength: 6,
    })
    .map((cs) => cs.join(""));

  it("Property 11: deterministic — same text always yields the same hash", () => {
    // Feature: jd-question-generator, Property 11: Provenance, authorship, and jdHash determinism
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(jdHash(text)).toBe(jdHash(text));
      }),
      RUNS,
    );
  });

  it("Property 11: stable under whitespace/case normalization", () => {
    // Feature: jd-question-generator, Property 11: Provenance, authorship, and jdHash determinism
    const wsChars = [" ", "\t", "\n", "\r"];
    fc.assert(
      fc.property(
        fc.array(wordArb, { minLength: 1, maxLength: 10 }),
        fc.array(fc.integer({ min: 1, max: 4 }), { minLength: 1 }),
        (words, gaps) => {
          const canonical = words.join(" ");

          // Build a cosmetically different but normalization-equivalent text:
          // leading/trailing whitespace, runs of mixed whitespace between
          // words, and randomized letter case.
          let messy = "  \t ";
          words.forEach((w, i) => {
            const cased = w
              .split("")
              .map((c, j) => (j % 2 === 0 ? c.toUpperCase() : c))
              .join("");
            messy += cased;
            if (i < words.length - 1) {
              const runLen = gaps[i % gaps.length];
              messy += wsChars[i % wsChars.length].repeat(runLen);
            }
          });
          messy += " \n  ";

          expect(jdHash(messy)).toBe(jdHash(canonical));
        },
      ),
      RUNS,
    );
  });
});
