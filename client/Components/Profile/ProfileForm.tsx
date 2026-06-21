"use client";
import { FC, useState, FormEvent } from "react";
import { useUser, User } from "@/Utils/UserContext";
import { nameSchema, usernameSchema } from "@/Utils/validation/profileSchemas";
import { updateProfile } from "@/Utils/Apicalls/Profile";
import Toast from "@/Utils/Toast";
import { Pencil, X } from "lucide-react";

interface ProfileFormProps {
  user: User;
}

interface FormErrors {
  name?: string;
  username?: string;
}

const ProfileForm: FC<ProfileFormProps> = ({ user }) => {
  const { refreshUser } = useUser();
  const [name, setName] = useState<string>(user.name || "");
  const [username, setUsername] = useState<string>(user.username || "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const handleCancel = (): void => {
    setName(user.name || "");
    setUsername(user.username || "");
    setErrors({});
    setEditMode(false);
  };

  const validateFields = (): boolean => {
    const newErrors: FormErrors = {};

    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0].message;
    }

    const usernameResult = usernameSchema.safeParse(username);
    if (!usernameResult.success) {
      newErrors.username = usernameResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await updateProfile({
        action: "updateProfile",
        name: name.trim(),
        username: username.trim(),
      });

      if (response.status === 200) {
        Toast("success", "Profile updated successfully");
        setEditMode(false);
        try {
          await refreshUser();
        } catch {
          Toast("warning", "Profile saved, but display may be stale");
        }
      } else if (response.status === 409) {
        setErrors({ username: "Username is already taken" });
      } else {
        const data = await response.json();
        Toast("error", data.message || "Failed to update profile");
      }
    } catch {
      Toast("error", "Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Profile Information
        </h2>
        {!editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)]/30 rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="profile-name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editMode}
            className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm dark:text-white ${
              editMode
                ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50"
                : "bg-gray-100 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="profile-username"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="profile-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!editMode}
            className={`w-full px-4 py-3 rounded-lg border outline-none transition-all text-sm dark:text-white ${
              editMode
                ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50"
                : "bg-gray-100 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email Field (always read-only) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="profile-email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={user.email || ""}
            readOnly
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 outline-none text-sm dark:text-gray-400 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Submit Button — only visible in edit mode */}
        {editMode && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md shadow-[var(--color-primary)]/20 hover:opacity-90 disabled:opacity-50 mt-2"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
