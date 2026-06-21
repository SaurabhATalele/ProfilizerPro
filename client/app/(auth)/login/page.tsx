"use client";
import { FC } from "react";
import Login from "@/Components/Login/Login";
import { useTheme } from "@/Utils/ThemeContext";

const Page: FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main className="flex max-h-screen max-w-screen flex-col items-center justify-between bg-white text-black dark:bg-black dark:text-white">
        <Login />
      </main>
    </div>
  );
};

export default Page;
