"use client";
import Login from "@/Components/Login/Login";
import React from "react";
import { useTheme } from "@/Context/ThemeContext";
import Navbar from "@/Components/Navbar/Navbar";

export default function page() {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main
        className={` flex p-10 max-h-screen max-w-screen flex-col items-center justify-between bg-white text-black  dark:bg-black dark:text-white`}
      >
        <Navbar />
        <Login />
      </main>
    </div>
  );
}

// export default page;
