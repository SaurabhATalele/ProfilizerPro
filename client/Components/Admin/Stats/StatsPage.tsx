"use client";
import React, { FC, useEffect, useState, ChangeEvent } from "react";
import { getTopCandidates } from "@/Utils/Apicalls/getTopcandidates";
import { getAssignments } from "@/Utils/Apicalls/getAssignments";
import { getCandidatesAdmin } from "@/Utils/Apicalls/getCandidatesAdmin";
import { Bar, Pie } from "react-chartjs-2";
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

interface Assignment {
  _id: string;
  id: string;
  name: string;
}

interface TestDataItem {
  _id: string;
  name: string;
  averageScore: number;
}

interface CandidateDataItem {
  _id: {
    test: string;
    month: number;
  };
  count: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
    data: number[];
  }>;
}

const sampleData: ChartData = {
  labels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      backgroundColor: "rgba(255, 99, 132, 0.5)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ],
};

const options = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "No of Candidates",
      },
      ticks: {
        stepSize: 1,
        suggestedMin: 0,
        max: 10,
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
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const StatsPage: FC = () => {
  const [testData, setTestData] = useState<TestDataItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [selectedNumber, setSelectedNumber] = useState<number>(100);
  const [chartData, setChartData] = useState<ChartData>(sampleData);
  const [pieData, setPieData] = useState<ChartData>(sampleData);
  const [activeTest, setActiveTest] = useState<string>("Python");

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

  const getCand = async (): Promise<void> => {
    function processData(data: CandidateDataItem[], testName: string): number[] {
      const monthlyCounts = new Array(12).fill(0);
      data.map((item) => {
        if (item._id.test !== testName) return;
        const monthIndex = item._id.month - 1;
        monthlyCounts[monthIndex] = item.count || 0;
      });
      return monthlyCounts;
    }

    const getTotalCount = (data: CandidateDataItem[]): number[] => {
      const updatedData = data.reduce(
        (acc: Record<string, number>, curr) => {
          const testName = curr._id.test;
          if (!acc[testName]) {
            acc[testName] = 0;
          }
          acc[testName] += curr.count;
          return acc;
        },
        {},
      );
      return Object.values(updatedData);
    };

    const data = await getCandidatesAdmin();

    setChartData({
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "No of Candidates",
          data: processData(data.message, activeTest),
          backgroundColor: [
            "green",
            "pink",
            "yellow",
            "orange",
            "lime",
            "purple",
            "brown",
            "black",
            "blue",
            "grey",
            "white",
          ],
        },
      ],
    });

    setPieData({
      labels: [...new Set(data.message.map((item: CandidateDataItem) => item._id.test))],
      datasets: [
        {
          label: "No of Candidates",
          data: getTotalCount(data.message),
          backgroundColor: [
            "orange",
            "lime",
            "pink",
            "yellow",
            "purple",
            "blue",
            "green",
            "brown",
            "black",
            "grey",
            "white",
          ],
        },
      ],
    });
  };

  useEffect(() => {
    getCand();
  }, [activeTest]);

  const getAllAssignments = async (): Promise<void> => {
    const resp = await getAssignments();
    setAssignments(resp.data);
  };

  useEffect(() => {
    fetchData();
  }, [selectedAssignment, selectedNumber]);

  const fetchData = async (): Promise<void> => {
    const data = await getTopCandidates({
      n: selectedNumber,
      id: selectedAssignment,
    });
    setTestData(data.data);
  };

  useEffect(() => {
    getAllAssignments();
  }, []);

  return (
    <div className=" flex flex-col gap-10 w-3/4">
      <h1 className="text-xl text-center font-medium">Admin Dashboard</h1>
      <div className="flex max-h-96 items-center">
        <div className="flex flex-col w-1/2 gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm">Select Test</p>
            <select
              name="testname"
              id="testaname"
              className="border w-fit px-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setActiveTest(e.target.value);
              }}
            >
              <option value="testname">Select Name</option>
              {assignments &&
                assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment.name}>
                    {assignment.name}
                  </option>
                ))}
            </select>
          </div>
          <Bar
            data={chartData}
            options={options}
            className="w-1/2 flex flex-col  h-full"
          />
          <p className="text-sm text-center">
            Candidates given the Test (Monthwise)
          </p>
        </div>

        <div className="flex flex-col items-center justify-center w-1/2 h-3/4 gap-3">
          <Pie
            data={pieData}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                },
              },
              scales: {
                y: {
                  display: false,
                },
                x: {
                  display: false,
                },
              },
            }}
            className="w-1/2 h-1/2"
          />
          <p className="text-sm text-center">Total Candidates given the Test</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg text-center font-medium">
          List of Top Performers
        </h2>

        <div className="flex gap-5 items-end">
          <div className="flex flex-col w-fit gap-2">
            <p className="text-sm font-light">Test Name</p>
            <select
              name="testname"
              id="tesname"
              className="border w-fit px-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedAssignment(e.target.value)}
            >
              <option value="testname">Select Name</option>
              {assignments &&
                assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment.id}>
                    {assignment.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col w-fit gap-2">
            <p className="text-sm font-light">No. of Candidates</p>
            <select
              name="testname"
              id="tesname"
              className="border w-fit px-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedNumber(parseInt(e.target.value))}
            >
              <option value="testname">Select Number</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {testData && testData.length > 0 ? (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg my-5">
            <table className="w-full  text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr className="bg-primary-light text-white">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Candidate Name</th>
                  <th className="px-6 py-3"> Email</th>
                  <th className="px-6 py-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {testData.map((data, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{data.name}</td>
                    <td className="px-6 py-4">{data._id}</td>
                    <td className="px-6 py-4">
                      {Number(data.averageScore).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No data found</p>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
