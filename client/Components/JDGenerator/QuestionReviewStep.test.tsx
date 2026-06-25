// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type {
  GeneratedQuestion,
  ParsedSignal,
} from "@/Utils/types/JDGenerator";

vi.mock("@/Utils/Apicalls/JDGenerator", () => ({
  addQuestion: vi.fn(),
  // QuestionCard (rendered as a child) imports these:
  editQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  regenerateQuestion: vi.fn(),
}));
vi.mock("@/Utils/Toast", () => ({ default: vi.fn() }));

import QuestionReviewStep from "./QuestionReviewStep";

const confirmedSignal: ParsedSignal = {
  role: "Backend Engineer",
  seniority: "mid",
  skills: ["TypeScript"],
  mustHave: ["TypeScript"],
  niceToHave: ["GraphQL"],
};

const questions: GeneratedQuestion[] = [
  {
    kind: "mcq",
    text: "MCQ question one",
    difficulty: "easy",
    skillTag: "TypeScript",
    edited: false,
  },
  {
    kind: "aptitude",
    text: "Aptitude question one",
    difficulty: "medium",
    edited: false,
  },
  {
    kind: "coding",
    text: "Coding question one",
    difficulty: "hard",
    skillTag: "GraphQL",
    language: "Python",
    testCases: [
      { input: "1", expectedOutput: "1", hidden: false },
      { input: "2", expectedOutput: "2", hidden: false },
      { input: "3", expectedOutput: "3", hidden: true },
    ],
    edited: false,
  },
  {
    kind: "mcq",
    text: "MCQ question two",
    difficulty: "medium",
    skillTag: "TypeScript",
    edited: false,
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QuestionReviewStep — grouped question rendering (Req 7.1)", () => {
  it("renders questions grouped by kind with per-group headings and counts", () => {
    render(
      <QuestionReviewStep
        setId="set-1"
        questions={questions}
        shortfall={null}
        confirmedSignal={confirmedSignal}
        onQuestionsChange={vi.fn()}
        onProceed={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    // Group headings show kind label + count.
    expect(
      screen.getByRole("heading", { name: "Multiple Choice (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Coding (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Aptitude (1)" }),
    ).toBeInTheDocument();

    // Every question's text is rendered.
    expect(screen.getByText("MCQ question one")).toBeInTheDocument();
    expect(screen.getByText("MCQ question two")).toBeInTheDocument();
    expect(screen.getByText("Aptitude question one")).toBeInTheDocument();
    expect(screen.getByText("Coding question one")).toBeInTheDocument();
  });

  it("renders difficulty and skillTag badges within the grouped cards", () => {
    render(
      <QuestionReviewStep
        setId="set-1"
        questions={questions}
        shortfall={null}
        confirmedSignal={confirmedSignal}
        onQuestionsChange={vi.fn()}
        onProceed={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    // Difficulty badges across the set.
    expect(screen.getAllByText("easy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("hard").length).toBeGreaterThan(0);

    // skillTag badges from the confirmed signal.
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0);
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
    // Coding language badge.
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("renders the shortfall notice when some requested questions are missing", () => {
    render(
      <QuestionReviewStep
        setId="set-1"
        questions={questions}
        shortfall={{ mcq: 1, coding: 0, aptitude: 2 }}
        confirmedSignal={confirmedSignal}
        onQuestionsChange={vi.fn()}
        onProceed={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Some requested questions couldn't be generated/),
    ).toBeInTheDocument();
  });
});
