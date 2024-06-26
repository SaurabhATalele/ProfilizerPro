"use client";
import React, { useEffect, useState } from "react";

import { IoIosArrowBack } from "react-icons/io";
import { CgNotes } from "react-icons/cg";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineBallot } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import Link from "next/link";
import { getAttemptedTests } from "@/Utils/Apicalls/GetAttemptedTests";
import DashBoardView from "./DashBoardView";
import TestsAttempted from "./TestsAttempted";
import { usePathname } from "next/navigation";

function Dashboard() {
  const [active, setActive] = useState(0);
  const pathname = usePathname();

  const path = pathname.split("/");
  console.log(path);

  const [data, setData] = useState([]);

  let count = 0;

  useEffect(() => {
    if (count == 0) {
      getTests();
      count++;
    }
  }, []);

  const getTests = async () => {
    const data = await getAttemptedTests();
    console.log(data);
    setData(data);
  };

  return (
    <>
      <div className="min-w-screen max-w-screen h-screen flex flex-row justify-end">
        {/* the sidebar of the dashboard page  */}
        <div className=" w-1/6 bg-primary-light min-h-screen fixed left-0">
          <Link href={"/"} className="flex items-center mx-5 h-24 text-white">
            <IoIosArrowBack className="text-white text-xl " />
            <span className="font-normal text-md">Home</span>
          </Link>

          <ul className=" flex flex-col gap-5">
            <li
              onClick={() => setActive(0)}
              className={` px-3 py-2  text-md flex gap-2 items-center ${active === 0 ? "bg-white text-primary-light" : "text-white"}`}
            >
              <RxDashboard className="2xl:text-xl" /> <span>Dashboard</span>
            </li>
            <li
              onClick={() => setActive(1)}
              className={` px-3 py-2  text-md flex gap-2 items-center ${active === 1 ? "bg-white text-primary-light" : "text-white"}`}
            >
              <CgNotes className="text-xl" /> <span>Tests Attempted</span>
            </li>
            <li
              onClick={() => setActive(2)}
              className={` px-3 py-2  text-md flex gap-2 items-center ${active === 2 ? "bg-white text-primary-light" : "text-white"}`}
            >
              <MdOutlineBallot className="text-xl" /> <span>All Tests </span>
            </li>
          </ul>

          <Link
            href={"/logout"}
            className="text-white flex gap-2 mx-5 items-center absolute bottom-5"
          >
            <IoIosLogOut className="text-2xl" /> Logout
          </Link>
        </div>

        {/* main content of the dashboard page  */}
        {active === 0 && <DashBoardView data={data} />}
        {active === 1 && <TestsAttempted data={data} />}
      </div>
    </>
  );
}

export default Dashboard;
