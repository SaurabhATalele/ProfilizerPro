"use client";
import  { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";
import { BASE_BACKEND_URL } from "@/Utils/constants";

interface ResetProps {
  email: string;
  otp: string;
}

const Reset: FC<ResetProps> = ({ email, otp }) => {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleReset = async (pass: string, confirmPass: string): Promise<void> => {
    if (pass !== confirmPass) {
      Toast("error", "Passwords do not match");
      return;
    }
    if (pass.length < 8) {
      Toast("error", "Password must be at least 8 characters");
      return;
    }
    try {
      const res = await fetch(`${BASE_BACKEND_URL}/api/v1/users/reset-pass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: pass, otp }),
      });
      const data = await res.json();
      if (res.status !== 200) {
        Toast("error", data.message || "Could not reset password");
        return;
      }
      Toast("success", "Password Reset Success");
      router.push("/login");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="relative w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-6 mt-12">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Enter your new password below.
        </p>
        <div className="w-full flex flex-col gap-4">
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="relative">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <button
          className="w-full bg-[var(--color-primary)] hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md shadow-[var(--color-primary)]/20"
          onClick={() => handleReset(password, confirmPassword)}
        >
          Reset Password
        </button>
      </div>
    </>
  );
};

export default Reset;
