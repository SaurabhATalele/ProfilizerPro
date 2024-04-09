"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { IoIosArrowBack } from "react-icons/io";
import { CgNotes } from "react-icons/cg";
import { RxDashboard } from "react-icons/rx";
import { MdOutlineBallot } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import Link from "next/link";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  BarElement,
  Tooltip,
  ArcElement,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";

function Dashboard() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    BarElement,
    Tooltip,
    ArcElement,
    Legend,
    LineElement,
    PointElement,
  );

  const state = {
    labels: [
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ],
    // datasets  stored in an array of objects
    datasets: [
      {
        // you can set individual colors for each bar
        backgroundColor: ["red", "green", "pink", "orange", "yellow", "lime"],
        hoverBackgroundColor: "lightblue",
        borderRadius: 8,
        data: [40, 40, 50, 60, 80, 90, 70],
      },
    ],
  };
  const state1 = {
    labels: ["Lagos", "Usa", "Canada", "Australia"],
    datasets: [
      {
        backgroundColor: ["blue", "green", "yellow", "red"],
        data: [30, 4, -5, 37],
        borderColor: "black",
      },
    ],
  };

  return (
    <>
      <div className=" w-screen h-screen flex flex-row">
        {/* the sidebar of the dashboard page  */}
        <div className=" w-1/6 bg-primary-light h-screen">
          <Link href={"/"} className="flex items-center mx-5 h-24 text-white">
            <IoIosArrowBack className="text-white text-xl " />
            <span className="font-normal text-md">Home</span>
          </Link>

          <ul className="mx-10 flex flex-col gap-5">
            <li className="flex gap-2 items-center text-white">
              <RxDashboard className="text-xl" />{" "}
              <span className="text-white">Dashboard</span>
            </li>
            <li className="flex gap-2 text-white items-center">
              <CgNotes className="text-xl" /> <span>Tests Attempted</span>
            </li>
            <li className="flex gap-2 text-white items-center">
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
        <div className=" w-5/6 p-5 flex flex-col h-screen justify-between">
          <div className="  flex text-center  align-middle justify-between flex-row m-10 h-1/2 ">
            <div className=" w-1/2  h-72 shadow-md ">
              <Bar data={state} />
            </div>
            <div className=" w-96 h-72 shadow-md ">
              <Pie data={state} />
            </div>
          </div>
          <div className=" h-72  ">
            <Line data={state} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
