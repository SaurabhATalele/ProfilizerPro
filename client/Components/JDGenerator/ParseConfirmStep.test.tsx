// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import type { ParsedSignal } from "@/Utils/types/JDGenerator";

// Toast wraps react-toastify; mock it so tests stay free of UI side-effects.
vi.mock("@/Utils/Toast", () => ({ default: vi.fn() }));

import ParseConfirmStep from "./ParseConfirmStep";

const baseSignal: ParsedSignal = {
  role: "Backend Engineer",
  seniority: "mid",
  skills: ["TypeScript", "Node.js"],
  mustHave: ["TypeScript"],
  niceToHave: ["GraphQL"],
};

afterEach(cleanup);

describe("ParseConfirmStep — editable parse form (Req 4.1)", () => {
  it("renders the parsed role, seniority, and skills in an editable form", () => {
    render(
      <ParseConfirmStep
        parsed={baseSignal}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    // Role is an editable text input pre-filled with the parsed role.
    const role = screen.getByLabelText("Role") as HTMLInputElement;
    expect(role).toBeInTheDocument();
    expect(role.value).toBe("Backend Engineer");

    // Seniority is a constrained select pre-set to the parsed value.
    const seniority = screen.getByLabelText("Seniority") as HTMLSelectElement;
    expect(seniority.value).toBe("mid");

    // Each parsed skill renders as a removable chip.
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove TypeScript" }),
    ).toBeInTheDocument();
  });

  it("sends edited role, changed seniority, and updated skills in the confirmed signal", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ParseConfirmStep
        parsed={baseSignal}
        onConfirm={onConfirm}
        onBack={vi.fn()}
      />,
    );

    // Edit the role.
    const role = screen.getByLabelText("Role");
    await user.clear(role);
    await user.type(role, "Senior Backend Engineer");

    // Change the seniority via the select.
    await user.selectOptions(screen.getByLabelText("Seniority"), "senior");

    // Remove an existing skill chip.
    await user.click(screen.getByRole("button", { name: "Remove Node.js" }));
    expect(screen.queryByText("Node.js")).not.toBeInTheDocument();

    // Add a new skill chip.
    const skillInput = screen.getByPlaceholderText(
      "Add a skill and press Enter",
    );
    await user.type(skillInput, "PostgreSQL");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();

    // Confirm and assert the emitted signal reflects every edit.
    await user.click(
      screen.getByRole("button", { name: "Confirm & Start Test" }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith({
      ...baseSignal,
      role: "Senior Backend Engineer",
      seniority: "senior",
      skills: ["TypeScript", "PostgreSQL"],
    });
  });

  it("does not confirm when the role is emptied", async () => {
    const onConfirm = vi.fn();
    render(
      <ParseConfirmStep
        parsed={baseSignal}
        onConfirm={onConfirm}
        onBack={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm & Start Test" }),
    );

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
