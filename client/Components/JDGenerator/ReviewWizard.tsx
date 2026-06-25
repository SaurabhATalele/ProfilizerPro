"use client";
import { FC, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/Utils/ThemeContext";
import TestContext from "@/Utils/TestContext";
import type { ParsedSignal } from "@/Utils/types/JDGenerator";
import type { Difficulty } from "@/Utils/builder/difficulty";
import { jdSignalToAttempt } from "@/Utils/builder/jdToAttempt";
import JDInputStep from "./JDInputStep";
import ParseConfirmStep from "./ParseConfirmStep";

/** Ordered wizard steps. */
type WizardStep = "input" | "parse";

const STEP_ORDER: WizardStep[] = ["input", "parse"];

const STEP_LABELS: Record<WizardStep, string> = {
  input: "Job Description",
  parse: "Confirm & Start Test",
};

interface TopicContextType {
  setTopics: (value: {
    topic: string;
    subtopics: Record<string, string>;
    difficulty?: Difficulty;
    customAssignmentId?: string;
  }) => void;
}

/**
 * ReviewWizard turns a job description into an attemptable test: the user pastes
 * a JD, confirms the parsed hiring signal, and is taken straight into the
 * existing custom test-attempt flow (no separate question-review/save step).
 */
const ReviewWizard: FC = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { setTopics } = useContext(TestContext) as TopicContextType;

  const [step, setStep] = useState<WizardStep>("input");
  const [parsedSignal, setParsedSignal] = useState<ParsedSignal | null>(null);

  const currentIndex = STEP_ORDER.indexOf(step);

  const handleParsed = (_id: string, parsed: ParsedSignal): void => {
    setParsedSignal(parsed);
    setStep("parse");
  };

  // Confirming the signal launches the test directly via the existing custom
  // attempt flow (mirrors BuilderPage: set context, then navigate).
  const handleConfirm = (signal: ParsedSignal): void => {
    const { topic, subtopics, difficulty } = jdSignalToAttempt(signal);
    setTopics({ topic, subtopics, difficulty });
    router.push("/test/attempt/custom");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="pt-12 w-full bg-white text-black dark:bg-black dark:text-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold md:text-3xl">
              JD Test Generator
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Paste a job description, confirm the role and skills, and attempt a
              tailored test right away.
            </p>
          </header>

          {/* Step indicator */}
          <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm">
            {STEP_ORDER.map((s, i) => {
              const isActive = s === step;
              const isComplete = i < currentIndex;
              return (
                <li key={s} className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white dark:bg-white dark:text-black"
                        : isComplete
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`hidden sm:inline ${
                      isActive
                        ? "font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                  {i < STEP_ORDER.length - 1 && (
                    <span className="mx-1 text-gray-300 dark:text-gray-700">
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Active step */}
          <section>
            {step === "input" && <JDInputStep onParsed={handleParsed} />}

            {step === "parse" && parsedSignal && (
              <ParseConfirmStep
                parsed={parsedSignal}
                onConfirm={handleConfirm}
                onBack={() => setStep("input")}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReviewWizard;
