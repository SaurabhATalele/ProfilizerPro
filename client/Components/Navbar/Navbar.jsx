"use client";
import React, { useEffect, useState, useContext } from "react";
import { useTheme } from "../../Utils/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/Utils/Apicalls/User";
import { UserContext } from "@/Utils/UserContext";
import { GoSun } from "react-icons/go";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState({});
  // const { user, setUser } = useContext(UserContext);

  useEffect(() => {
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
      className=" fixed flex justify-between bg-[#ffffff27] 
    dark:bg-[#00000027] dark:border-[#3c3c3c52] backdrop-blur-md
     items-center px-5 w-3/4 border rounded-xl  border-[#c3c3c354] h-14"
    >
      <div className="flex gap-1">
        <Image src={"/logo.svg"} width={15} height={15} alt="logo" />
        <Link href={"/"}>
          <h3 className="font-bold text-primary-light dark:text-primary-dark ">
            ProfilizePro
          </h3>
        </Link>
      </div>
      <ul className="flex gap-5 h-full items-center">
        <li>
          <Link
            href={"/"}
            className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href={"/aboutus"}
            className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
          >
            About
          </Link>
        </li>

        {!isLogin && (
          <>
            <li>
              <Link
                href={"/login"}
                className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href={"/register"}
                className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
              >
                SignUp
              </Link>
            </li>
          </>
        )}
        <li>
          <Link
            href={"/contactus"}
            className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
          >
            ContactUs
          </Link>
        </li>

        {isLogin && (
          <>
            <li>
              <Link
                href={"/dashboard"}
                className="hover:border-b-primary-light underline text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
              >
                Dashboard
              </Link>
            </li>
            <li>Welcome!! {user.username}</li>
          </>
        )}
        <li>
          <button onClick={toggleDarkMode}>
            {!darkMode && <GoSun className="text-xl" />}
            {darkMode && <FaMoon />}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
