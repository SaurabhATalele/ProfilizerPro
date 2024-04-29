import React, { useState } from "react";
import AddTest from "./Tests/AddTest";
import StatsPage from "./Stats/StatsPage";

const DashBoard = () => {
  const [active, setActive] = useState("Tests");
  return (
    <div className="w-full h-screen flex flex-col items-center gap-5">
      {/* <div className="flex  border  font-sans  rounded-lg">
        <button
          className={`px-5 py-1 rounded-l-md ${active === "Tests" ? "bg-primary-light text-white" : "border border-gray-400"}`}
          onClick={() => setActive("Tests")}
        >
          Tests
        </button>
        <button
          className={`px-5 py-1 rounded-r-md ${active === "Stats" ? "bg-primary-light text-white" : "border border-gray-400"}`}
          onClick={() => setActive("Stats")}
        >
          Stats
        </button>
      </div> */}
      <label class="inline-flex items-center mb-5 cursor-pointer">
        <span class="me-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Tests
        </span>
        <input
          type="checkbox"
          value=""
          onChange={() => {
            setActive(active === "Tests" ? "Stats" : "Tests");
          }}
          class="sr-only peer"
        />
        <div class="relative w-11 h-6 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light bg-primary-light"></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Stats
        </span>
      </label>
      {active === "Tests" && <AddTest />}
      {active === "Stats" && <StatsPage />}
    </div>
  );
};

export default DashBoard;
