"use client";
import { FC, useState, useEffect } from "react";
import { useTheme } from "@/Utils/ThemeContext";
import { X } from "lucide-react";
import Toast from "@/Utils/Toast";

interface Topic {
  name: string;
}

interface EditTestData {
  _id: string;
  name?: string;
  description?: string;
  icon?: string;
  topics?: Topic[];
}

interface EditModalProps {
  data: EditTestData;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  refresh: boolean;
  setRefresh: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const EditModal: FC<EditModalProps> = ({ data, openModal, setOpenModal, refresh, setRefresh }) => {
  const { darkMode } = useTheme();
  const [topics, setTopics] = useState<Topic[]>(data.topics || []);
  const [testName, setTestName] = useState<string>(data.name || "");
  const [description, setDescription] = useState<string>(data.description || "");
  const [icon, setIcon] = useState<string>(data.icon || "");
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTopics(data.topics || []);
    setTestName(data.name || "");
    setDescription(data.description || "");
    setIcon(data.icon || "");
  }, [data]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpenModal(false);
    };
    if (openModal) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [openModal, setOpenModal]);

  const handleEditTest = async (): Promise<void> => {
    setLoading(true);
    const payload = { id: data._id, name: testName, description, icon, topics };
    try {
      const res = await fetch("/api/v1/assignment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        Toast("success", result.message || "Test updated successfully");
        setRefresh(!refresh);
        setOpenModal(false);
      } else {
        Toast("error", result.message || "Failed to update test");
      }
    } catch (error) {
      console.log(error);
      Toast("error", "Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = darkMode
    ? "w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm"
    : "w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";

  const labelClass = darkMode
    ? "text-sm font-medium text-gray-300"
    : "text-sm font-medium text-gray-700";

  if (!openModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
      onClick={() => setOpenModal(false)}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${
          darkMode
            ? "bg-[#1a1a1a] border-gray-800"
            : "bg-white border-gray-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 pt-6 pb-4 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Edit Assessment
            </h2>
            <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Update test details
            </p>
          </div>
          <button
            onClick={() => setOpenModal(false)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label htmlFor="edit-name" className={labelClass}>
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. JavaScript Fundamentals"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-desc" className={labelClass}>Description</label>
            <textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the assessment..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-icon" className={labelClass}>Icon URL</label>
            <input
              type="text"
              id="edit-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://example.com/icon.png"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Topics</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && topic.trim()) {
                    e.preventDefault();
                    setTopics([...topics, { name: topic.trim() }]);
                    setTopic("");
                  }
                }}
                placeholder="Type and press Enter"
                className={inputClass}
              />
              <button
                onClick={() => {
                  if (topic.trim()) {
                    setTopics([...topics, { name: topic.trim() }]);
                    setTopic("");
                  }
                }}
                disabled={!topic.trim()}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap bg-[var(--color-primary)]"
              >
                Add
              </button>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {topics.map((topicItem, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${
                      darkMode
                        ? "bg-[var(--color-primary)]/15 text-white border-[var(--color-primary)]/25"
                        : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
                    }`}
                  >
                    {topicItem.name}
                    <button
                      onClick={() => setTopics(topics.filter((_, i) => i !== index))}
                      className="hover:text-red-500 transition-colors"
                      aria-label={`Remove ${topicItem.name}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
          darkMode ? "border-gray-800 bg-[#121212]" : "border-gray-100 bg-gray-50/50"
        }`}>
          <button
            onClick={() => setOpenModal(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleEditTest}
            disabled={!testName.trim() || loading}
            className="px-5 py-2 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-primary)]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
