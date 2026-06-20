"use client";
import { FC } from "react";
import { usePathname } from "next/navigation";
import ViewTest from "@/Components/ViewTest/ViewTest";
import Navbar from "@/Components/Navbar/Navbar";

const Page: FC = () => {
  const pathname = usePathname();
  const id = pathname.split("/").filter((x) => x);
  const test = id[id.length - 1];

  return (
    <div className="w-full flex justify-center p-10">
      <Navbar />
      <ViewTest test={test} />
    </div>
  );
};

export default Page;
