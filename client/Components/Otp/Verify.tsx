"use client";
import  { FC, useState } from "react";
import OtpInput from "react-otp-input";

interface VerifyProps {
  handleOtp: (otp: string) => void;
}

const Verify: FC<VerifyProps> = ({ handleOtp }) => {
  const [otp, setOtp] = useState<string>("");

  return (
    <div className="relative w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg flex flex-col text-center items-center justify-center gap-6 mt-12">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
        You&apos;ve Got Email
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        We have sent the OTP verification code to your email address. Check your
        email and enter the code below.
      </p>

      <OtpInput
        value={otp}
        onChange={setOtp}
        numInputs={4}
        renderSeparator={<span className="w-3"> </span>}
        renderInput={(props) => <input {...props} />}
        inputType="number"
        inputStyle={
          "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 w-10 text-center p-2 text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
        }
        skipDefaultStyles
      />
      <button
        className="w-full bg-[var(--color-primary)] hover:bg-opacity-90 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md shadow-[var(--color-primary)]/20"
        onClick={() => handleOtp(otp)}
      >
        Verify
      </button>
    </div>
  );
};

export default Verify;
