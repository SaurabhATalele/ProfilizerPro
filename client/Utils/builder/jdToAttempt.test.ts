import { describe, it, expect } from "vitest";
import { jdSignalToAttempt } from "./jdToAttempt";
import type { ParsedSignal } from "@/Utils/types/JDGenerator";

const signal = (over: Partial<ParsedSignal>): ParsedSignal => ({
  role: "Frontend Engineer",
  seniority: "mid",
  skills: [],
  mustHave: [],
  niceToHave: [],
  ...over,
});

describe("jdSignalToAttempt", () => {
  it("dedupes skills case-insensitively across the three lists", () => {
    const ctx = jdSignalToAttempt(
      signal({ mustHave: ["React"], skills: ["react"], niceToHave: ["Redux"] }),
    );
    expect(Object.keys(ctx.subtopics)).toEqual(["React", "Redux"]);
    expect(ctx.subtopics.React).toBe("3");
  });

  it("caps the number of subtopics", () => {
    const many = Array.from({ length: 20 }, (_, i) => `skill${i}`);
    const ctx = jdSignalToAttempt(signal({ skills: many }));
    expect(Object.keys(ctx.subtopics).length).toBe(8);
  });

  it("maps seniority to difficulty", () => {
    expect(jdSignalToAttempt(signal({ seniority: "intern" })).difficulty).toBe("easy");
    expect(jdSignalToAttempt(signal({ seniority: "senior" })).difficulty).toBe("hard");
  });

  it("falls back to a role subtopic when no skills are present", () => {
    const ctx = jdSignalToAttempt(signal({ role: "QA Analyst" }));
    expect(ctx.subtopics["QA Analyst"]).toBe("5");
  });
});
