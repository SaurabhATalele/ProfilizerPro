"use client";
import { FC } from "react";
import ExamDash from "@/Components/examDash/ExamDash";
import { useTheme } from "@/Utils/ThemeContext";

const Page: FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="w-full flex justify-center min-h-screen bg-white dark:bg-[#0c0c0c]">
        <ExamDash />
      </div>
    </div>
  );
};

export default Page;
