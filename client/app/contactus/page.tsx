"use client";
import { FC } from "react";
import Contactus from "@/Components/Contactus/Contactus";
import { useTheme } from "@/Utils/ThemeContext";
import Navbar from "@/Components/Navbar/Navbar";

const Page: FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main className="flex max-h-screen max-w-screen flex-col items-center justify-between bg-white text-black dark:bg-black dark:text-white">
        <Navbar />
        <Contactus />
      </main>
    </div>
  );
};

export default Page;
