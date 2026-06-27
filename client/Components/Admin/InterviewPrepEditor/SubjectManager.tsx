"use client";
import { FC, useState } from "react";
import { Trash2, X } from "lucide-react";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/Utils/Apicalls/InterviewPrep";
import Toast from "@/Utils/Toast";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";
import SubjectIcon from "@/Components/InterviewPrep/SubjectIcon";

interface SubjectManagerProps {
  subjects: NavTreeSubject[];
  onChanged: () => void;
}

/** The subject currently open in the edit dialog. */
interface EditingSubject {
  _id: string;
  label: string;
  icon: string;
}

const inputClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212] dark:text-white";

/** Subject CRUD. Editing opens a dialog that edits both label and icon. */
const SubjectManager: FC<SubjectManagerProps> = ({ subjects, onChanged }) => {
  const [label, setLabel] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  // Edit dialog state.
  const [editing, setEditing] = useState<EditingSubject | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

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

  const handleSaveEdit = async (): Promise<void> => {
    if (!editing) return;
    if (!editing.label.trim()) {
      Toast("error", "Label cannot be empty.");
      return;
    }
    setSavingEdit(true);
    try {
      const resp = await updateSubject(editing._id, {
        label: editing.label.trim(),
        // Send empty string to clear the icon (falls back to default).
        icon: editing.icon.trim(),
      });
      if (!resp || !resp.ok) throw new Error("update failed");
      Toast("success", "Subject updated.");
      setEditing(null);
      onChanged();
    } catch {
      Toast("error", "Couldn't update subject.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (
      !window.confirm("Delete this subject? Only allowed when it has no chapters.")
    ) {
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
      {/* Create */}
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
            Icon (image URL or emoji)
          </label>
          <input
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="https://…/icon.svg or ☕"
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

      {/* List */}
      <ul className="flex flex-col gap-2">
        {subjects.map((s) => (
          <li
            key={s._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-base dark:bg-gray-800">
                <SubjectIcon icon={s.icon} className="h-4 w-4" />
              </span>
              {s.label}{" "}
              <span className="text-xs text-gray-400">
                ({s.chapters.length} chapters)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setEditing({ _id: s._id, label: s.label, icon: s.icon ?? "" })
                }
                className="rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
              >
                Edit
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

      {/* Edit dialog */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit subject"
          onClick={() => !savingEdit && setEditing(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-[#1a1a1a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Subject</h3>
              <button
                type="button"
                onClick={() => !savingEdit && setEditing(null)}
                aria-label="Close"
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  Label
                </label>
                <input
                  className={`${inputClass} w-full`}
                  value={editing.label}
                  onChange={(e) =>
                    setEditing({ ...editing, label: e.target.value })
                  }
                  placeholder="Java"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  Icon (image URL or emoji)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    className={`${inputClass} w-full`}
                    value={editing.icon}
                    onChange={(e) =>
                      setEditing({ ...editing, icon: e.target.value })
                    }
                    placeholder="https://…/icon.svg or ☕"
                  />
                  {/* Live preview of the resolved icon. */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-lg text-[var(--color-primary)] dark:bg-[var(--color-secondary)]/10 dark:text-[var(--color-secondary)]">
                    <SubjectIcon icon={editing.icon} className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Use an image URL (e.g. an SVG/PNG link) or an emoji. Leave
                  blank for the default.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={savingEdit}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
              >
                {savingEdit && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
