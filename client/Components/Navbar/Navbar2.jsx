import { useTheme } from "../../Utils/ThemeContext";
import React from "react";
import { FaSun, FaMoon, FaHome } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const Navbar2 = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className=" fixed flex justify-between bg-[#ffffff27] 
    dark:bg-[#00000027] dark:border-[#3c3c3c52] backdrop-blur-md
     items-center px-5 w-screen  rounded-xl  h-14"
    >
      <Link href={"/"} className="flex gap-1">
        <Image src={"/logo.svg"} width={15} height={15} />
        <h3 className="font-bold text-primary-light dark:text-primary-dark ">
          ProfilizePro
        </h3>
      </Link>
      <div className="flex gap-3">
        <Link href={"/"} className="flex gap-1">
          <FaHome />
        </Link>

        <button onClick={toggleDarkMode}>
          {!darkMode && <FaSun />}
          {darkMode && <FaMoon />}
        </button>
      </div>
    </div>
  );
};

export default Navbar2;
