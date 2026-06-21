"use client";
import { FC, useState } from "react";
import { useTheme } from "@/Utils/ThemeContext";
import AddTest from "./Tests/AddTest";
import StatsPage from "./Stats/StatsPage";
import { ClipboardList, BarChart3 } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: FC<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: "tests", label: "Tests", icon: ClipboardList },
  { id: "stats", label: "Statistics", icon: BarChart3 },
];

const DashBoard: FC = () => {
  const { darkMode } = useTheme();
  const [active, setActive] = useState<string>("tests");

  return (
    <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col items-center gap-6 px-5 py-8 max-w-7xl mx-auto">
      {/* Tabs */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl border ${
          darkMode
            ? "bg-[var(--color-primary)]/50 border-gray-800"
            : "bg-gray-100 border-gray-200"
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? darkMode
                    ? "bg-[var(--color-primary)] text-white shadow-md"
                    : "bg-[var(--color-primary)] text-white shadow-md"
                  : darkMode
                    ? "text-gray-400 hover:text-white hover:bg-blue-900/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {active === "tests" && <AddTest />}
        {active === "stats" && <StatsPage />}
      </div>
    </div>
  );
};

export default DashBoard;
