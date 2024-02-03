
"use client";
import Signup from "@/Components/Signup/Signup";
import React from "react";
import { useTheme } from "@/Utils/ThemeContext";
import Navbar from "@/Components/Navbar/Navbar2";

export default function page() {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main
        className={` flex  max-h-screen max-w-screen flex-col items-center justify-between bg-white text-black  dark:bg-black dark:text-white`}
      >
        <Navbar />
        <Signup />
      </main>
    </div>
  );
}


