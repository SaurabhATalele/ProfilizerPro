"use client";
import { FC } from "react";
import { useTheme } from "../../Utils/ThemeContext";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const AdminNavbar: FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const linkStyle =
    "text-primary transition-all duration-300 py-2 px-1 font-medium text-sm relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] dark:after:bg-[var(--color-secondary)] after:transition-all after:duration-300 hover:after:w-full";

  return (
    <div className="fixed flex justify-center dark:bg-[#00000020] dark:border-[#ffffff10] backdrop-blur-md z-30 items-center px-5 w-full border border-[#00000010] h-20 font-medium">
      <div className="flex justify-between w-full md:w-[90%] items-center">
        <div className="flex gap-3 items-center">
          <Image src={"/logo.svg"} width={20} height={20} alt="logo" />
          <Link href={"/"}>
            <h3 className="font-bold text-primary text-xl tracking-tight">
              ProfilizePro
            </h3>
          </Link>
        </div>

        <ul className="flex flex-row gap-6 h-full items-center">
          <li>
            <Link href={"/"} className={linkStyle}>
              Home
            </Link>
          </li>
          <li>
            <Link href={"/contactus"} className={linkStyle}>
              Contact Us
            </Link>
          </li>
          <li>
            <Link href={"/admin"} className={linkStyle}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href={"/logout"} className={linkStyle}>
              Logout
            </Link>
          </li>
          <li className="relative group">
            <button
              onClick={(e) => toggleDarkMode(e)}
              className="relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 bg-gray-300 dark:bg-gray-600"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center ${
                  darkMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              >
                {!darkMode && <Sun className="w-3 h-3" />}
                {darkMode && <Moon className="w-3 h-3 text-slate-800" />}
              </span>
            </button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              {darkMode ? "Light mode" : "Dark mode"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNavbar;
