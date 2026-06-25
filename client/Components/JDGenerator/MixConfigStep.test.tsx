// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import type { ParsedSignal } from "@/Utils/types/JDGenerator";

const { mockGenerate } = vi.hoisted(() => ({ mockGenerate: vi.fn() }));

vi.mock("@/Utils/Apicalls/JDGenerator", () => ({
  generateQuestions: mockGenerate,
}));
vi.mock("@/Utils/Toast", () => ({ default: vi.fn() }));

import MixConfigStep from "./MixConfigStep";

const confirmedSignal: ParsedSignal = {
  role: "Backend Engineer",
  seniority: "mid",
  skills: ["TypeScript"],
  mustHave: ["TypeScript"],
  niceToHave: ["GraphQL"],
};

const pendingResponse = (): Promise<Response> =>
  new Promise<Response>(() => {
    /* never resolves */
  });

const jsonResponse = (ok: boolean, body: unknown): Promise<Response> =>
  Promise.resolve({ ok, json: async () => body } as Response);

const renderStep = (onGenerated = vi.fn()) =>
  render(
    <MixConfigStep
      jobDescriptionId="jd-1"
      confirmedSignal={confirmedSignal}
      onGenerated={onGenerated}
      onBack={vi.fn()}
    />,
  );

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MixConfigStep — per-action loading indicator (Req 10.1)", () => {
  it("shows a loading indicator while the generate call is pending", async () => {
    const user = userEvent.setup();
    mockGenerate.mockReturnValue(pendingResponse());

    renderStep();

    await user.click(
      screen.getByRole("button", { name: "Generate Questions" }),
    );

    const button = await screen.findByRole("button", { name: /Generating/ });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Generating...");
  });
});

describe("MixConfigStep — descriptive error messages (Req 10.2)", () => {
  it("shows a descriptive error when generation fails after retry", async () => {
    const user = userEvent.setup();
    mockGenerate.mockReturnValue(
      jsonResponse(false, { error: "generation_failed" }),
    );

    renderStep();

    await user.click(
      screen.getByRole("button", { name: "Generate Questions" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Generation failed after retrying. Adjust the inputs and try again.",
    );
  });

  it("shows a network error message when the call throws", async () => {
    const user = userEvent.setup();
    const onGenerated = vi.fn();
    mockGenerate.mockRejectedValue(new Error("offline"));

    renderStep(onGenerated);

    await user.click(
      screen.getByRole("button", { name: "Generate Questions" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Network error while generating. Please try again.",
    );
    expect(onGenerated).not.toHaveBeenCalled();
  });
});
