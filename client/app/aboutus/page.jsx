
"use client";
import AboutUs from "@/Components/AboutUs/AboutUs";
import React from "react";
import { useTheme } from "@/Utils/ThemeContext";
import Navbar from "@/Components/Navbar/Navbar";

export default function Page() {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main
        className={` flex p-10 max-h-screen max-w-screen flex-col items-center justify-between bg-white text-black  dark:bg-black dark:text-white`}
      >
        <Navbar />
        <AboutUs />
      </main>
    </div>
  );
}


