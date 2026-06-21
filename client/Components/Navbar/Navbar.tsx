"use client";
import { useState, useRef, useEffect, FC } from "react";
import { useTheme } from "../../Utils/ThemeContext";
import { Sun, Moon, User as UserIcon, LayoutDashboard, ClipboardList, Settings, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MdMenu, MdClose } from "react-icons/md";
import { useUser } from "@/Utils/UserContext";

const Navbar: FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, isLogin } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLLIElement>(null);

  const linkStyle =
    "text-primary dark:text-gray-200 transition-all duration-300 py-2 px-1 font-medium text-sm relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] dark:after:bg-[var(--color-secondary)] after:transition-all after:duration-300 hover:after:w-full";

  // Close the profile menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user.username || "U").charAt(0).toUpperCase();

  return (
    <div className="fixed flex justify-center dark:bg-[#00000020] dark:border-[#ffffff10] backdrop-blur-md z-30 items-center px-5 w-full border border-[#00000010] h-16 font-medium">
      <div className="flex justify-between w-full md:w-[90%] items-center">
        <div className="flex gap-3 items-center">
          <Image src={"/logo.svg"} width={20} height={20} alt="logo" />
          <Link href={"/"}>
            <h3 className="font-bold text-primary dark:text-white text-xl tracking-tight">
              ProfilizePro
            </h3>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-primary dark:text-white text-3xl focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>

        <ul
          className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row gap-6 h-auto md:h-full items-center absolute md:relative top-20 md:top-0 left-0 w-full md:w-auto bg-white/98 dark:bg-[#121212]/98 md:bg-transparent md:dark:bg-transparent py-6 md:py-0 border-b md:border-none border-[#00000010] dark:border-[#ffffff10]`}
        >
          <li>
            <Link href={"/"} className={linkStyle}>
              Home
            </Link>
          </li>
          <li>
            <Link href={"/all-tests"} className={linkStyle}>
              Tests
            </Link>
          </li>
          <li>
            <Link href={"/aboutus"} className={linkStyle}>
              About
            </Link>
          </li>
          <li>
            <Link href={"/contactus"} className={linkStyle}>
              Contact Us
            </Link>
          </li>

          {!isLogin && (
            <>
              <li>
                <Link href={"/login"} className={linkStyle}>
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href={"/register"}
                  className={`${linkStyle} bg-[var(--color-primary)] text-white dark:text-black px-4 py-2 rounded-lg hover:bg-primary-dark border hover:border-1 dark:border-[var(--color-primary)] transition-all duration-300 shadow-md hover:shadow-lg after:hidden font-semibold text-sm`}
                >
                  SignUp
                </Link>
              </li>
            </>
          )}

          {isLogin && (
            <li>
              <Link
                href={user.isAdmin ? "/admin" : "/dashboard"}
                className={linkStyle}
              >
                Dashboard
              </Link>
            </li>
          )}

          {isLogin && (
            <li ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 group"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-semibold text-sm shadow-md">
                  {initials}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-primary dark:text-gray-200 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.username}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href={user.isAdmin ? "/admin" : "/dashboard"}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/all-tests"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      My Tests
                    </Link>
                    <Link
                      href="/contactus"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="py-1 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href="/logout"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </li>
          )}
          <li className="relative group">
            <button
              onClick={(e) => toggleDarkMode(e)}
              className="relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 bg-gray-300 dark:bg-gray-600"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {/* Sliding circle */}
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center ${darkMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
              >
                {!darkMode && (
                  <Sun className="w-3 h-3" />
                )}
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

export default Navbar;
