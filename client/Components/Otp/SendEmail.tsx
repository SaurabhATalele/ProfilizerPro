"use client";
import React, { FC, useState, FormEvent } from "react";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";

interface SendEmailProps {
  handleSendMail: (email: string) => Promise<void>;
}

const SendEmail: FC<SendEmailProps> = ({ handleSendMail }) => {
  const [email, setEmail] = useState<string>("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await handleSendMail(email);
      Toast("success", "OTP sent to your email");
    } catch (err) {
      console.error(err);
      Toast("error", "Failed to send OTP");
    }
  };

  return (
    <div className="w-1/2">
      <ToastContainer />
      <div className="relative w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg flex flex-col items-center gap-6 mt-12">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Enter your email address below to receive an OTP to reset your
          password.
        </p>
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            required
          />
          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md shadow-[var(--color-primary)]/20"
          >
            Get OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendEmail;
