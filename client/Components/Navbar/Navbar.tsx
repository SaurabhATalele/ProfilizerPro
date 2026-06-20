"use client";
import { useState, useLayoutEffect, FC } from "react";
import { useTheme } from "../../Utils/ThemeContext";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/Utils/Apicalls/User";
import { MdMenu, MdClose } from "react-icons/md";
import { User } from "@/Utils/UserContext";

const Navbar: FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [user, setUser] = useState<User>({});
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const linkStyle =
    "text-primary transition-all duration-300 py-2 px-1 font-medium text-sm relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] dark:after:bg-[var(--color-secondary)] after:transition-all after:duration-300 hover:after:w-full";

  useLayoutEffect(() => {
    const getUserHandler = async (): Promise<void> => {
      try {
        const resp = await getUser();
        const userData = await resp.json();
        if (userData === false) {
          localStorage.removeItem("token");
          return;
        }
        if (userData.username) {
          setIsLogin(true);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
      }
    };

    const cookie = localStorage.getItem("token");
    if (cookie) {
      getUserHandler();
    }
  }, []);

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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-primary text-3xl focus:outline-none"
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
                  className={`${linkStyle} bg-[var(--color-primary)] dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-primary-dark dark:hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg after:hidden font-semibold text-sm`}
                >
                  SignUp
                </Link>
              </li>
            </>
          )}

          {isLogin && (
            <>
              <li>
                <Link
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="text-primary transition-all duration-300 py-2 px-1 font-medium text-sm relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--color-primary)] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Dashboard
                </Link>
              </li>
              <li className="text-sm font-medium text-primary">
                Welcome, {user.username}
              </li>
            </>
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
