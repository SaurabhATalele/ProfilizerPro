"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../Utils/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { getCookie } from "cookies-next";
import Link from "next/link";
import Image from "next/image";
const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const cookie = getCookie("autToken");
    if (cookie) setIsLogin(true);
  });
  return (
    <div
      className=" fixed flex justify-between bg-[#ffffff27] 
    dark:bg-[#00000027] dark:border-[#3c3c3c52] backdrop-blur-md
     items-center px-5 w-3/4 border rounded-xl  border-[#c3c3c354] h-14"
    >
      <div className="flex gap-1">
        <Image src={"/logo.svg"} width={15} height={15} alt="logo"/>
        <Link href={'/'}>
        <h3 className="font-bold text-primary-light dark:text-primary-dark ">
          ProfilizePro
        </h3>
        </Link>
      </div>
      <ul className="flex gap-5 h-full items-center"> 

      <li>
          <Link
            href={"/aboutus"}
            className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
          >
            About
          </Link>
        </li>
      
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
        <li>
          <Link
            href={"/contactus"}
            className="hover:border-b-primary-light text-primary-light dark:text-primary-dark hover:border-b-2 cursor-pointer h-1/2 active:border-b-primary-light"
          >
            ContactUs
          </Link>
        </li>
        <li>
          <button onClick={toggleDarkMode}>
            {!darkMode && <FaSun />}
            {darkMode && <FaMoon />}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
