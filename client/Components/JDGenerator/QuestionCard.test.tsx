// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import type { GeneratedQuestion } from "@/Utils/types/JDGenerator";

// Mock the API wrappers so no real network call happens.
const { mockRegenerate, mockDelete, mockEdit } = vi.hoisted(() => ({
  mockRegenerate: vi.fn(),
  mockDelete: vi.fn(),
  mockEdit: vi.fn(),
}));

vi.mock("@/Utils/Apicalls/JDGenerator", () => ({
  regenerateQuestion: mockRegenerate,
  deleteQuestion: mockDelete,
  editQuestion: mockEdit,
}));
vi.mock("@/Utils/Toast", () => ({ default: vi.fn() }));

import QuestionCard from "./QuestionCard";

const mcq: GeneratedQuestion = {
  kind: "mcq",
  text: "What does REST stand for?",
  options: ["Representational State Transfer", "Really Easy Syntax Tool"],
  answer: "Representational State Transfer",
  skillTag: "API Design",
  difficulty: "easy",
  edited: false,
};

/** A Response-like object whose body never resolves (keeps the action pending). */
const pendingResponse = (): Promise<Response> =>
  new Promise<Response>(() => {
    /* never resolves */
  });

/** A Response-like object that resolves with a body and ok flag. */
const jsonResponse = (ok: boolean, body: unknown): Promise<Response> =>
  Promise.resolve({
    ok,
    json: async () => body,
  } as Response);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QuestionCard — badges (Req 7.1)", () => {
  it("renders difficulty and skillTag badges with the question content", () => {
    render(
      <QuestionCard
        setId="set-1"
        question={mcq}
        index={0}
        onSetUpdated={vi.fn()}
      />,
    );

    expect(screen.getByText("What does REST stand for?")).toBeInTheDocument();
    // Difficulty badge.
    expect(screen.getByText("easy")).toBeInTheDocument();
    // skillTag badge.
    expect(screen.getByText("API Design")).toBeInTheDocument();
  });
});

describe("QuestionCard — per-action loading indicator (Req 10.1)", () => {
  it("shows a loading spinner on the regenerate button while the call is pending", async () => {
    const user = userEvent.setup();
    mockRegenerate.mockReturnValue(pendingResponse());

    const { container } = render(
      <QuestionCard
        setId="set-1"
        question={mcq}
        index={0}
        onSetUpdated={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Regenerate/ }));

    // The spinner element appears inside the card while pending.
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();

    // While pending, the other actions are disabled (busy state).
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete/ })).toBeDisabled();
  });
});

describe("QuestionCard — descriptive error messages (Req 10.2)", () => {
  it("shows a rate-limit error message when regenerate returns rate_limited", async () => {
    const user = userEvent.setup();
    mockRegenerate.mockReturnValue(jsonResponse(false, { error: "rate_limited" }));

    render(
      <QuestionCard
        setId="set-1"
        question={mcq}
        index={0}
        onSetUpdated={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Regenerate/ }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Please wait before regenerating again.");
  });

  it("shows a descriptive error message when delete fails", async () => {
    const user = userEvent.setup();
    mockDelete.mockReturnValue(jsonResponse(false, { error: "not_found" }));

    render(
      <QuestionCard
        setId="set-1"
        question={mcq}
        index={0}
        onSetUpdated={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Delete/ }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't delete the question. Please try again.");
  });
});
