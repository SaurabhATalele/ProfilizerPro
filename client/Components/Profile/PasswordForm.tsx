"use client";
import { FC, useState, FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Pencil, X } from "lucide-react";
import Toast from "@/Utils/Toast";
import { updateProfile } from "@/Utils/Apicalls/Profile";
import { changePasswordSchema } from "@/Utils/validation/profileSchemas";
import { useUser } from "@/Utils/UserContext";

interface FieldErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

const PasswordForm: FC = () => {
  const { refreshUser } = useUser();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleCancel = (): void => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrors({});
    setEditMode(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const result = changePasswordSchema.safeParse({
      oldPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await updateProfile({
        action: "changePassword",
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      if (res.status === 200) {
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setEditMode(false);
        Toast("success", "Password changed successfully");
        try {
          await refreshUser();
        } catch {
          Toast("warning", "Profile saved, but display may be stale");
        }
      } else if (res.status === 403) {
        setErrors({ oldPassword: "Old password is incorrect" });
      } else if (res.status === 400) {
        const data = await res.json();
        setErrors({
          newPassword:
            data.message || "New password must be different from current password",
        });
      } else {
        Toast("error", "Something went wrong. Please try again later.");
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
          {editMode ?
           "Change Password"
            :
            "Password"
          }
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

      {!editMode ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click Edit to change your password.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Old Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="oldPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-sm dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Toggle current password visibility"
              >
                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (8-128 characters)"
                className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-sm dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Toggle new password visibility"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmNewPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all text-sm dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.confirmNewPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md shadow-[var(--color-primary)]/20 hover:opacity-90 disabled:opacity-50 mt-2"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PasswordForm;
