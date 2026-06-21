"use client";
import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { useUser } from "@/Utils/UserContext";
import Loader from "@/Components/Loader/Loader";
import ProfileForm from "@/Components/Profile/ProfileForm";
import PasswordForm from "@/Components/Profile/PasswordForm";

const ProfilePage: FC = () => {
  const { user, isLogin } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [isLogin, router]);

  const handleRetry = (): void => {
    setError("");
    setLoading(true);
    // Re-check auth state — the UserContext's refreshUser runs on mount
    if (!isLogin) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0c0c0c] px-4">
        <div className="max-w-md text-center p-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
          <p className="text-red-500 dark:text-red-400 text-lg font-semibold mb-4">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initials = (user.username || user.name || "U").charAt(0).toUpperCase();

  return (
    <>
      <ToastContainer />
      <div className="w-full max-w-2xl mx-auto px-4 py-24">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)] text-white text-2xl font-bold shadow-md">
            {initials}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, {user.name || user.username || "User"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your profile information and password
            </p>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className="mb-6 p-6 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
          <ProfileForm user={user} />
        </div>

        {/* Password Form Card */}
        <div className="p-6 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
          <PasswordForm />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
