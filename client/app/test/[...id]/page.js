"use client";
import React from "react";
import { usePathname } from "next/navigation";
import ViewTest from "@/Components/ViewTest/ViewTest";
import Navbar from "@/Components/Navbar/Navbar";

const page = () => {
  const pathname = usePathname();
  const id = pathname.split("/").filter((x) => x);
  const test = id[id.length - 1];
  return (
    <div className="w-full flex justify-center">
      <Navbar />
      <ViewTest test={test} />
    </div>
  );
};

export default page;
