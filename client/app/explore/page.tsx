"use client";
import { FC } from "react";
import BuilderPage from "@/Components/Explore/BuilderPage";
import { useTheme } from "@/Utils/ThemeContext";

const Page: FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="w-full flex justify-center min-h-screen bg-white dark:bg-[#0c0c0c]">
        <BuilderPage />
      </div>
    </div>
  );
};

export default Page;
