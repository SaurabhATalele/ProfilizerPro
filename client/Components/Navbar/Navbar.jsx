"use client";
import React, { useState, useLayoutEffect } from "react";
import { useTheme } from "../../Utils/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/Utils/Apicalls/User";
import { MdOutlineWbSunny, MdMenu, MdClose } from "react-icons/md";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const { user, setUser } = useContext(UserContext);

  const linkStyle = "hover:border-b-primary-light text-primary border-bottom-0 hover:border-b-2 transition duration-500 py-2 cursor-pointer h-1/2 active:border-b-primary-light"

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
    const getUserHandler = async () => {
      const resp = await getUser();
      const user = await resp.json();
      console.log(user);
      if (user === false) {
        localStorage.removeItem("token");
        return;
      }
      if (user.username) {
        setIsLogin(true);
        setUser(user);
      }
    };

    const cookie = localStorage.getItem("token");
    if (cookie) {
      getUserHandler();
    }
  }, []);
  return (
    <div
      className="fixed flex justify-center 
    dark:bg-[#00000027] dark:border-[#3c3c3c52] backdrop-blur-md z-30
     items-center px-5 w-full border  border-bottom-[#c3c3c354] h-20 bg-blend-lighten font-medium"
    >
      <div className="flex justify-between w-full md:w-[90%] lg:w-3/4 xl:w-1/2 items-center">
        <div className="flex gap-3">

          <Image src={"/logo.svg"} width={15} height={15} alt="logo" />
          <Link href={"/"}>
            <h3 className="font-bold text-primary text-2xl">ProfilizePro</h3>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-primary text-3xl focus:outline-none"
          >
            {isMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>

        <ul className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-5 h-auto md:h-full items-center absolute md:relative top-20 md:top-0 left-0 w-full md:w-auto bg-white/95 dark:bg-[#121212]/95 md:bg-transparent md:dark:bg-transparent py-5 md:py-0 border-b md:border-none border-[#c3c3c354] dark:border-[#3c3c3c52]`}>
          <li>
            <Link
              href={"/"}
              className={linkStyle}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href={"/aboutus"}
              className={linkStyle}
            >
              About
            </Link>
          </li>

          {!isLogin && (
            <>
              <li>
                <Link
                  href={"/login"}
                  className={linkStyle}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href={"/register"}
                  className={linkStyle}
                >
                  SignUp
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              href={"/contactus"}
              className={linkStyle}
            >
              Contact Us
            </Link>
          </li>

          {isLogin && (
            <>
              <li>
                <Link
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="hover:border-b-primary-light underline text-primary hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
                >
                  Dashboard
                </Link>
              </li>
              <li>Welcome!! {user.username}</li>
            </>
          )}
          <li>
            <button onClick={toggleDarkMode}>
              {!darkMode && <MdOutlineWbSunny className="text-xl" />}
              {darkMode && <FaMoon />}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
