"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import { Line } from "react-chartjs-2";

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
        <div className=" w-1/4 bg-cyan-400 h-screen"></div>
        <div className=" w-3/4  flex flex-col h-screen justify-between">
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
