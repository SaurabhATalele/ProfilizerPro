"use client";
import { FC } from "react";
import AllTests from "@/Components/AllTestView/AllTests";
import Navbar from "@/Components/Navbar/Navbar";
import { useTheme } from "@/Utils/ThemeContext";

const Page: FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex flex-col w-full items-center px-5 bg-white text-black dark:bg-black dark:text-white min-h-screen">
        <Navbar />
        <AllTests />
      </div>
    </div>
  );
};

export default Page;
