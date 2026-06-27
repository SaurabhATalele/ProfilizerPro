"use client";
import { FC, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { Sparkles, Plus, ArrowRight, Loader2, ListChecks } from "lucide-react";
import TestContext from "@/Utils/TestContext";
import { getUser } from "@/Utils/Apicalls/User";
import Toast from "@/Utils/Toast";
import Loader from "@/Components/Loader/Loader";
import SubtopicRow from "@/Components/Explore/SubtopicRow";
import {
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  SubtopicItem,
  isValidName,
  normalizeName,
  addSubtopic,
  mergeSuggestions,
  buildSubtopicCountMap,
  selectedCount,
  clampQuestionCount,
} from "@/Utils/builder/subtopics";
import {
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  Difficulty,
} from "@/Utils/builder/difficulty";
import { prefillFromRecord } from "@/Utils/builder/customAssignment";
import { BASE_BACKEND_URL } from "@/Utils/constants";

interface TopicContextType {
  topics: {
    topic: string;
    subtopics: Record<string, string>;
  };
  setTopics: (value: {
    topic: string;
    subtopics: Record<string, string>;
    difficulty?: Difficulty;
    customAssignmentId?: string;
  }) => void;
}

interface SuggestResponse {
  subtopics?: string[];
  message?: string;
}

const BuilderPage: FC = () => {
  const [topic, setTopic] = useState<string>("");
  const [subtopics, setSubtopics] = useState<SubtopicItem[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [customAssignmentId, setCustomAssignmentId] = useState<string | null>(
    null,
  );

  const { setTopics } = useContext(TestContext) as TopicContextType;
  const router = useRouter();

  // Auth gate (Req 2.1, 2.2) + re-customization prefill (Req 15.1, 15.2, 15.3)
  useEffect(() => {
    // Load an existing custom assignment for re-customization when an `id`
    // query param is present. Read from window.location to avoid the
    // useSearchParams Suspense build constraint (client-only effect).
    const prefillFromId = async (): Promise<void> => {
      try {
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) {
          return;
        }
        const token = localStorage.getItem("token");
        const resp = await fetch(
          `${BASE_BACKEND_URL}/api/v1/assignment/custom?id=${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: { Authorization: token ?? "" },
          },
        );
        if (!resp.ok) {
          // Leave the builder empty on failure (e.g. not found / not owned).
          return;
        }
        const payload = await resp.json();
        const data = payload?.data;
        if (!data) {
          return;
        }
        const prefilled = prefillFromRecord({
          topic: data.topic,
          customSubtopics: data.customSubtopics,
          difficulty: data.difficulty,
        });
        setTopic(prefilled.topic);
        setSubtopics(prefilled.subtopics);
        setDifficulty(prefilled.difficulty);
        setCustomAssignmentId(id);
      } catch {
        // Resilient: leave the builder empty if prefill fails.
      }
    };

    const getUserHandler = async (): Promise<void> => {
      try {
        const resp = await getUser();
        const userData = await resp.json();
        if (userData === false || !userData?.username) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        setAuthChecked(true);
        await prefillFromId();
      } catch {
        router.push("/login");
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      getUserHandler();
    } else {
      router.push("/login");
    }
  }, [router]);

  // Suggest Subtopics (Req 3.2, 4.2, 4.3, 4.4, 4.5, 4.6)
  const handleSuggest = async (): Promise<void> => {
    if (normalizeName(topic).length === 0) {
      setError("Please enter a topic first");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch(`${BASE_BACKEND_URL}/api/v1/suggest-subtopics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = (await resp.json()) as SuggestResponse;
      if (!resp.ok || !Array.isArray(data.subtopics) || data.subtopics.length === 0) {
        setError(
          data.message || "Could not suggest subtopics. Please try again.",
        );
        return;
      }
      setSubtopics((prev) => mergeSuggestions(prev, data.subtopics as string[]));
    } catch {
      setError("Could not suggest subtopics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add custom subtopic (Req 6.2, 6.3, 6.4)
  const handleAddCustom = (): void => {
    if (!isValidName(customName)) {
      setError("Please enter a valid subtopic name");
      return;
    }
    setError(null);
    const next = addSubtopic(subtopics, customName, "custom");
    if (next.length === subtopics.length) {
      Toast("info", "Subtopic already exists");
      return;
    }
    setSubtopics(next);
    setCustomName("");
  };

  // Toggle selection (Req 7.1, 7.2, 8.1)
  const handleToggle = (name: string): void => {
    setSubtopics((prev) =>
      prev.map((item) =>
        item.name === name
          ? {
              ...item,
              selected: !item.selected,
              questionCount: item.selected ? item.questionCount : MIN_QUESTIONS,
            }
          : item,
      ),
    );
  };

  // Change question count (Req 8.2, 8.3, 8.4)
  const handleCountChange = (name: string, next: number): void => {
    setSubtopics((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, questionCount: clampQuestionCount(next) }
          : item,
      ),
    );
  };

  // Create assessment (Req 3.3, 9.1, 9.2, 9.3, 9.4)
  const handleCreate = (): void => {
    if (normalizeName(topic).length === 0) {
      setError("Please enter a topic first");
      return;
    }
    if (selectedCount(subtopics) === 0) {
      setError("Select at least one subtopic");
      return;
    }
    setError(null);
    const countMap = buildSubtopicCountMap(subtopics);
    const stringifiedMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(countMap)) {
      stringifiedMap[key] = String(value);
    }
    setTopics({
      topic: topic.trim(),
      subtopics: stringifiedMap,
      difficulty,
      customAssignmentId: customAssignmentId ?? undefined,
    });
    router.push("/test/attempt/custom");
  };

  if (!authChecked) {
    return <Loader />;
  }

  const selected = selectedCount(subtopics);

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0c0c0c] pt-20 pb-28 px-5">
      <ToastContainer />
      <div className="w-full max-w-2xl mx-auto mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Design Your Own Assessment
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pick a topic, add subtopics, and set how many questions each one
            contributes.
          </p>
        </div>

        {/* Topic input (Req 1.2, 1.3, 3.1) */}
        <label
          htmlFor="topic"
          className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
        >
          Topic
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. JavaScript, World History, Photosynthesis"
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-primary)] dark:focus:border-[var(--color-secondary)] transition-colors"
          />
          <button
            type="button"
            onClick={handleSuggest}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-medium text-sm px-5 py-3 rounded-lg shadow-md shadow-[var(--color-primary)]/20 dark:shadow-[var(--color-secondary)]/20 transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Suggesting..." : "Suggest Subtopics"}
          </button>
        </div>

        {/* Add custom subtopic (Req 6.1) */}
        <div className="mt-6">
          <label
            htmlFor="custom-subtopic"
            className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
          >
            Add a custom subtopic
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="custom-subtopic"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              placeholder="e.g. Closures"
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-primary)] dark:focus:border-[var(--color-secondary)] transition-colors"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm px-5 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Error message (Req 3.2, 3.3, 4.5, 6.3, 9.2) */}
        {error && (
          <p className="mt-4 text-sm font-medium text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Difficulty selector (Req 11.1, 11.2, 11.3, 11.4) */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Difficulty
          </label>
          <div
            role="group"
            aria-label="Select difficulty"
            className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 gap-1"
          >
            {DIFFICULTIES.map((level) => {
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setDifficulty(level)}
                  className={`px-5 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                    isSelected
                      ? "bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subtopic list (Req 4.3, 7.1, 7.2, 7.3, 8.1) */}
        {subtopics.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-[var(--color-primary)] dark:text-[var(--color-secondary)]" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Subtopics
              </h2>
              <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 dark:bg-[var(--color-secondary)]/15 text-[var(--color-primary)] dark:text-[var(--color-secondary)]">
                {selected} selected
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {subtopics.map((item) => (
                <SubtopicRow
                  key={item.name}
                  name={item.name}
                  selected={item.selected}
                  questionCount={item.questionCount}
                  source={item.source}
                  minQuestions={MIN_QUESTIONS}
                  maxQuestions={MAX_QUESTIONS}
                  onToggle={handleToggle}
                  onCountChange={handleCountChange}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sticky bottom action bar (Req 9.1) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selected > 0
              ? `${selected} subtopic${selected > 1 ? "s" : ""} selected — ready to go.`
              : "Select at least one subtopic to start."}
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-medium text-sm px-6 py-3 rounded-lg shadow-md shadow-[var(--color-primary)]/20 dark:shadow-[var(--color-secondary)]/20 transition-all duration-200 hover:opacity-90"
          >
            Create Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
