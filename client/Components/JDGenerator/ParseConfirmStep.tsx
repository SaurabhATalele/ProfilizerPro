"use client";
import { FC, useState, KeyboardEvent } from "react";
import type { ParsedSignal, Seniority } from "@/Utils/types/JDGenerator";
import Toast from "@/Utils/Toast";

const SENIORITY_OPTIONS: Seniority[] = [
  "intern",
  "junior",
  "mid",
  "senior",
  "lead",
];

interface ParseConfirmStepProps {
  parsed: ParsedSignal;
  /** Emit the confirmed (possibly edited) signal and advance the wizard. */
  onConfirm: (signal: ParsedSignal) => void;
  onBack: () => void;
}

/**
 * Step 2 — display the parsed signal in an editable form: role (text),
 * seniority (constrained select) and skill chips (add / remove). Produces the
 * confirmed signal sent to generation (Req 4.1 – 4.4).
 */
const ParseConfirmStep: FC<ParseConfirmStepProps> = ({
  parsed,
  onConfirm,
  onBack,
}) => {
  const [role, setRole] = useState<string>(parsed.role ?? "");
  const [seniority, setSeniority] = useState<Seniority>(
    parsed.seniority ?? "mid",
  );
  const [skills, setSkills] = useState<string[]>(parsed.skills ?? []);
  const [skillInput, setSkillInput] = useState<string>("");

  const addSkill = (): void => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (skill: string): void => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleConfirm = (): void => {
    if (!role.trim()) {
      Toast("error", "Role cannot be empty.");
      return;
    }
    onConfirm({
      ...parsed,
      role: role.trim(),
      seniority,
      skills,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="role" className="mb-2 block text-sm font-medium">
          Role
        </label>
        <input
          id="role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="seniority" className="mb-2 block text-sm font-medium">
          Seniority
        </label>
        <select
          id="seniority"
          value={seniority}
          onChange={(e) => setSeniority(e.target.value as Seniority)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
        >
          {SENIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Skills</span>
        <div className="mb-3 flex flex-wrap gap-2">
          {skills.length === 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              No skills yet — add some below.
            </span>
          )}
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
                className="text-gray-500 transition-colors duration-300 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="Add a skill and press Enter"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition-all duration-300 focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg"
        >
          Confirm & Start Test
        </button>
      </div>
    </div>
  );
};

export default ParseConfirmStep;
