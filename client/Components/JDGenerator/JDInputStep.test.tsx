// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

const { mockParseJD } = vi.hoisted(() => ({ mockParseJD: vi.fn() }));

vi.mock("@/Utils/Apicalls/JDGenerator", () => ({ parseJD: mockParseJD }));
vi.mock("@/Utils/Toast", () => ({ default: vi.fn() }));

import JDInputStep from "./JDInputStep";

/** 60-word JD so the client-side length gate is satisfied (>= 50 words). */
const longJD = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");

const pendingResponse = (): Promise<Response> =>
  new Promise<Response>(() => {
    /* never resolves */
  });

const jsonResponse = (ok: boolean, body: unknown): Promise<Response> =>
  Promise.resolve({ ok, json: async () => body } as Response);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("JDInputStep — per-action loading indicator (Req 10.1)", () => {
  it("shows a loading indicator while the parse call is pending", async () => {
    const user = userEvent.setup();
    mockParseJD.mockReturnValue(pendingResponse());

    render(<JDInputStep onParsed={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Paste the job description"), {
      target: { value: longJD },
    });

    await user.click(
      screen.getByRole("button", { name: "Parse Job Description" }),
    );

    // Button switches to the pending label and becomes disabled.
    const button = await screen.findByRole("button", { name: /Parsing/ });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Parsing...");
  });
});

describe("JDInputStep — descriptive error messages (Req 10.2)", () => {
  it("shows a descriptive error when the parse call returns an error", async () => {
    const user = userEvent.setup();
    mockParseJD.mockReturnValue(
      jsonResponse(false, { error: "not_a_job_description" }),
    );

    render(<JDInputStep onParsed={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Paste the job description"), {
      target: { value: longJD },
    });

    await user.click(
      screen.getByRole("button", { name: "Parse Job Description" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "This doesn't look like a job description. Paste a real JD to continue.",
    );
  });

  it("shows a descriptive error on a network failure without calling onParsed", async () => {
    const user = userEvent.setup();
    const onParsed = vi.fn();
    mockParseJD.mockRejectedValue(new Error("network down"));

    render(<JDInputStep onParsed={onParsed} />);

    fireEvent.change(screen.getByLabelText("Paste the job description"), {
      target: { value: longJD },
    });

    await user.click(
      screen.getByRole("button", { name: "Parse Job Description" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Network error while parsing. Please try again.",
    );
    expect(onParsed).not.toHaveBeenCalled();
  });

  it("blocks short input locally with a descriptive hint and skips the API call", async () => {
    const user = userEvent.setup();
    render(<JDInputStep onParsed={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Paste the job description"), {
      target: { value: "too short" },
    });

    await user.click(
      screen.getByRole("button", { name: "Parse Job Description" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/too short/i);
    expect(mockParseJD).not.toHaveBeenCalled();
  });
});
