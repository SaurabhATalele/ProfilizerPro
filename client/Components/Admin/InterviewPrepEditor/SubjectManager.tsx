"use client";
import { FC, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";

interface SubjectManagerProps {
  subjects: NavTreeSubject[];
  onChanged: () => void;
}

/** Simple Subject CRUD list. Delete is blocked server-side while chapters exist. */
const SubjectManager: FC<SubjectManagerProps> = ({ subjects, onChanged }) => {
  const [label, setLabel] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const inputClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white";

  const handleCreate = async (): Promise<void> => {
    if (!label.trim()) {
      Toast("error", "Subject label is required.");
      return;
    }
    setBusy(true);
    try {
      const resp = await createSubject({
        label: label.trim(),
        icon: icon.trim() || undefined,
      });
      if (!resp || !resp.ok) throw new Error("create failed");
      Toast("success", "Subject created.");
      setLabel("");
      setIcon("");
      onChanged();
    } catch {
      Toast("error", "Couldn't create subject.");
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async (id: string, current: string): Promise<void> => {
    const next = window.prompt("New subject label", current);
    if (!next || next.trim() === current) return;
    const resp = await updateSubject(id, { label: next.trim() });
    if (resp && resp.ok) {
      Toast("success", "Subject renamed.");
      onChanged();
    } else {
      Toast("error", "Couldn't rename subject.");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this subject? Only allowed when it has no chapters.")) {
      return;
    }
    const resp = await deleteSubject(id);
    if (resp && resp.ok) {
      Toast("success", "Subject deleted.");
      onChanged();
    } else if (resp && resp.status === 409) {
      Toast("error", "Subject still has chapters — remove them first.");
    } else {
      Toast("error", "Couldn't delete subject.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            Label
          </label>
          <input
            className={inputClass}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Java"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            Icon (optional)
          </label>
          <input
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Coffee"
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          Add Subject
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {subjects.map((s) => (
          <li
            key={s._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
          >
            <span className="text-sm font-medium">
              {s.label}{" "}
              <span className="text-xs text-gray-400">
                ({s.chapters.length} chapters)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRename(s._id, s.label)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s._id)}
                aria-label={`Delete ${s.label}`}
                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 dark:border-red-900 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {subjects.length === 0 && (
          <li className="text-sm text-gray-500 dark:text-gray-400">
            No subjects yet.
          </li>
        )}
      </ul>
    </div>
  );
};

export default SubjectManager;
