import React, { useState, useEffect } from "react";
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

let state2;
let active;
const DashBoardView = ({ data }) => {
  const [act, setAct] = useState("");
  useEffect(() => {
    setAct(active);
  }, [active]);
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

  const scalesTotal = {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "No of Tests", // Replace with your label
      },

      ticks: {
        stepSize: 1, // This ensures a minimum gap of 1
      },
    },
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: "Month", // Replace with your label
      },
    },
  };

  const scalesPerf = {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Marks obtained (%)", // Replace with your label
      },

      ticks: {
        stepSize: 1, // This ensures a minimum gap of 1
      },
    },
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: "Date", // Replace with your label
      },
    },
  };

  const optionstotal = {
    maintainAspectRatio: true,
    plugins: {
      legend: false,
    },
    scales: scalesTotal,
  };

  const optionsPerf = {
    maintainAspectRatio: true,
    plugins: {
      legend: false,
    },
    scales: scalesPerf,
  };
  var state = {
    labels: [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUNE",
      "JULY",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ],
    // datasets  stored in an array of objects
    datasets: [
      {
        // you can set individual colors for each bar
        backgroundColor: [
          "red",
          "green",
          "pink",
          "orange",
          "yellow",
          "lime",
          "blue",
          "purple",
          "brown",
          "black",
          "grey",
          "white",
        ],
        hoverBackgroundColor: "lightblue",
        borderRadius: 8,
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  state2 = {
    labels: ["Lagos", "Usa", "Canada", "Australia"],
    datasets: [
      {
        backgroundColor: ["blue", "green", "yellow", "red"],
        data: [30, 4, -5, 37],
        borderColor: "black",
      },
    ],
  };

  let count = 0;
  const getState2 = (testname, testdata) => {
    let labels = [];
    let scores = [];
    testdata.map((ele) => {
      const date = new Date(ele.date);
      // Extract day, month, and year
      const day = date.getUTCDate().toString().padStart(2, "0"); // Get day and pad with leading zero if necessary
      const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Get month (adding 1 as it's zero-based) and pad with leading zero if necessary
      const year = date.getUTCFullYear();

      // Format the date in "dd/mm/yyyy" format
      const formattedDate = `${day}/${month}/${year}`;
      labels.push(formattedDate);
      const perc = ele.score;
      scores.push(perc);
    });
    const d = {
      testname: testname,
      labels,
      datasets: [
        {
          data: scores,
          label: "Score",
          borderColor: "purple",
          borderWidth: 1,
          pointBorderWidth: 0,
          pointRadius: 5,
          backgroundColor: [
            "red",
            "green",
            "pink",
            "orange",
            "yellow",
            "lime",
            "blue",
            "purple",
            "brown",
            "black",
            "grey",
            "white",
          ],
        },
      ],
    };

    if (count === 0) {
      active = testname;
      count++;
    }
    state2[testname] = d;
  };

  if (data.data)
    Object.entries(data.data).forEach(([key, value]) => {
      if (value.assignmentName === active)
        value.attempts.map((ele) => {
          const date = new Date(ele.date);
          const monthNumber = date.getUTCMonth();
          state.datasets[0].data[monthNumber] += 1;
        });
      getState2(value.assignmentName, value.attempts);
    });

  return (
    <div className=" w-5/6 p-5 flex flex-col h-screen">
      <h1 className="text-xl font-bold">Welcome to ProfilizerPro Dashboard</h1>
      <p>Here you can see your performance in the tests you have attempted</p>
      <div className=" flex gap-3 my-10">
        {data.data &&
          Object.entries(data.data).map(([key, value]) => {
            return (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    active = value.assignmentName;
                    setAct(active);
                    console.log(act);
                  }}
                  className={`${act === value.assignmentName ? "w-20 p-2 bg-primary-light text-white rounded-sm" : "w-20"}`}
                >
                  {value.assignmentName}
                </button>
              </div>
            );
          })}
      </div>
      <div className="  flex text-center  align-middle justify-between flex-row m-10 gap-4 ">
        <div className="flex flex-col w-1/2  h-auto p-5 shadow-md rounded-lg gap-3 ">
          <Bar data={state} options={optionstotal} />
          <label htmlFor="Tests Attempted">
            Total Tests Attempted (Monthwise)
          </label>
        </div>
        {/* <div className=" w-96 h-72 shadow-md ">
          {state && <Pie data={state} />}
        </div> */}
        <div className="w-1/2 h-auto shadow-md p-2 rounded-lg">
          {state2[act] && <Line data={state2[act]} options={optionsPerf} />}
          <p className="text-center p-5">Tests performance</p>
        </div>
      </div>
    </div>
  );
};

export default DashBoardView;
