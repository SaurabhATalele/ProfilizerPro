"use client";
import { FC } from "react";
import dynamic from "next/dynamic";
import animationData from "./animations/animationSuccess.json";
import Link from "next/link";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
});

const SuccessScreen: FC = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-10 bg-[var(--color-backdrop-light)] dark:bg-[var(--color-dark-bg)] transition-all duration-300">
      <div className="flex flex-col gap-5 items-center w-full max-w-lg">
        <Lottie options={defaultOptions} height={300} width={300} />

        <h1 className="text-3xl md:text-4xl font-bold grad text-center">
          Test Submitted Successfully
        </h1>

        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
          Thank you for taking the test
        </p>

        <form className="w-full">
          <div className="mb-6">
            <label
              className="block uppercase tracking-wide text-[var(--color-primary)] text-xs font-bold mb-2 text-center"
              htmlFor="reviewContent"
            >
              Enter Your Feedback
            </label>

            <textarea
              className="block w-full resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-white py-3 px-4 leading-tight transition-all duration-300 focus:outline-none focus:border-[var(--color-primary)]"
              id="reviewContent"
              rows={4}
              placeholder="Enter review content"
            />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="bg-[var(--color-primary)] dark:bg-white text-white dark:text-black font-bold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none"
              type="button"
            >
              Submit Review
            </button>

            <Link
              href="/"
              className="border border-[var(--color-primary)] text-[var(--color-primary)] dark:text-white dark:border-white font-bold py-2 px-5 rounded-lg transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white dark:hover:bg-white dark:hover:text-black focus:outline-none"
            >
              Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuccessScreen;
