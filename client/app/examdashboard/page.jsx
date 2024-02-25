
"use client";
import Navbar2 from "@/Components/Navbar/Navbar2";
import React from "react";
import { useTheme } from "@/Utils/ThemeContext";

import Sidebar from "@/Components/Sidebar/Sidebar";

export default function page() {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main className={`flex max-h-screen max-w-screen bg-white text-black  dark:bg-black dark:text-white`}
      >  
      
      <Sidebar/>
      </main>
    </div>
  );
}


