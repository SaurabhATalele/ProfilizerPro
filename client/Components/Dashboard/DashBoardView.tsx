"use client";
import  { FC, useState, useEffect, ChangeEvent } from "react";
import { Bar } from "react-chartjs-2";
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

interface Attempt {
  date: string;
  score: number;
  correct: number;
  total: number;
  questions: Array<{
    _id: string;
    question: string;
    answer: string;
    yourAnswer: string;
  }>;
}

interface TestEntry {
  assignmentName: string;
  attempts: Attempt[];
}

interface DashBoardViewProps {
  data: {
    data: TestEntry[];
  } | null;
}

interface ChartDataset {
  backgroundColor: string[];
  hoverBackgroundColor?: string;
  borderRadius?: number;
  data: number[];
  label?: string;
  borderColor?: string;
  borderWidth?: number;
  pointBorderWidth?: number;
  pointRadius?: number;
}

interface ChartState {
  labels: string[];
  datasets: ChartDataset[];
  [key: string]: unknown;
}

let state2: Record<string, ChartState> = {};
let active: string = "";

const DashBoardView: FC<DashBoardViewProps> = ({ data }) => {
  const [act, setAct] = useState<string>("");

  useEffect(() => {
    setAct(active);
  }, []);

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
        text: "No of Tests",
      },
      ticks: {
        stepSize: 1,
      },
    },
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: "Month",
      },
    },
  };

  const scalesPerf = {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Marks obtained (%)",
      },
      ticks: {
        stepSize: 1,
      },
    },
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: "Date",
      },
    },
  };

  const optionstotal = {
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: scalesTotal,
  };

  const optionsPerf = {
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: scalesPerf,
  };

  const state = {
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
    datasets: [
      {
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

  let count = 0;
  const getState2 = (testname: string, testdata: Attempt[]): void => {
    const labels: string[] = [];
    const scores: number[] = [];
    testdata.map((ele) => {
      const date = new Date(ele.date);
      const day = date.getUTCDate().toString().padStart(2, "0");
      const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
      const year = date.getUTCFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      labels.push(formattedDate);
      const perc = ele.score;
      scores.push(perc);
    });

    const d: ChartState = {
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

  if (data?.data)
    Object.entries(data.data).forEach(([_key, value]) => {
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
      <p className="text-sm">Here you can see your performance in the tests you have attempted</p>
      <div className=" flex gap-3 my-10">
        <select
          name="testname"
          id="tesname"
          className="border w-fit px-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setAct(e.target.value)}
        >
          <option value="testname">Select Name</option>
          {data?.data &&
            Object.entries(data?.data).map(([key, value]) => (
              <option key={key} value={value.assignmentName}>
                {value.assignmentName}
              </option>
            ))}
        </select>
      </div>
      {data?.data ? (
        <div className="  flex text-center  align-middle justify-between flex-row m-10 gap-4 ">
          <div className="flex flex-col w-1/2  h-auto p-5 shadow-md rounded-lg gap-3 ">
            <Bar data={state} options={optionstotal} />
            <label htmlFor="Tests Attempted">
              Total Tests Attempted (Monthwise)
            </label>
          </div>
          <div className="w-1/2 h-auto shadow-md p-2 rounded-lg">
            {state2[act] && <Line data={state2[act]} options={optionsPerf} />}
            <p className="text-center p-5">Tests performance</p>
          </div>
        </div>
      ) : (
        "No tests attempted yet!"
      )}
    </div>
  );
};

export default DashBoardView;
