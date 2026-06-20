"use client";
import { FC } from "react";
import Navbar from "@/Components/Navbar/Navbar";
import { useTheme } from "../Utils/ThemeContext";
import Landing from "@/Components/Landing/Landing";
import Footer from "@/Components/Footer/FooterComponent";

const Home: FC = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main className="flex min-h-screen max-w-screen flex-col items-center justify-between bg-white text-black dark:bg-[var(--color-dark-bg)] dark:text-white">
        <Navbar />
        <Landing />
        <Footer />
      </main>
    </div>
  );
};

export default Home;
