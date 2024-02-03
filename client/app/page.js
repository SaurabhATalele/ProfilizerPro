"use client";
import Navbar from "@/Components/Navbar/Navbar";
import { useTheme } from "../Utils/ThemeContext";
import Landing from "@/Components/Landing/Landing";

import { useEffect } from "react";

export default function Home() {
  const { darkMode } = useTheme();
  useEffect(() => {});
  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main
        className={` flex min-h-screen max-w-screen flex-col items-center justify-between bg-white text-black p-10 dark:bg-black dark:text-white`}
      >
        <Navbar />
        <Landing />
      </main>
    </div>
  );
}
