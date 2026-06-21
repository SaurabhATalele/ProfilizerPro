"use client";
import { FC } from "react";
import { usePathname } from "next/navigation";
import ViewTest from "@/Components/ViewTest/ViewTest";
import { useTheme } from "@/Utils/ThemeContext";

const Page: FC = () => {
  const { darkMode } = useTheme();
  const pathname = usePathname();
  const id = pathname.split("/").filter((x) => x);
  const test = id[id.length - 1];

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="w-full flex justify-center px-10 bg-white text-black dark:bg-black dark:text-white min-h-screen">
        <ViewTest test={test} />
      </div>
    </div>
  );
};

export default Page;
