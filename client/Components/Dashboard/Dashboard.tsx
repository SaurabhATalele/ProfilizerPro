"use client";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Compass,
  ListChecks,
  Home,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/Utils/ThemeContext";
import { getAttemptedTests } from "@/Utils/Apicalls/GetAttemptedTests";
import DashBoardView from "./DashBoardView";
import TestsAttempted from "./TestsAttempted";

interface AttemptedTestData {
  data: Array<{
    assignmentName: string;
    attempts: Array<{
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
    }>;
  }>;
}

const Dashboard: FC = () => {
  const { darkMode } = useTheme();
  const [active, setActive] = useState<number>(0);
  const [data, setData] = useState<AttemptedTestData | null>(null);

  useEffect(() => {
    getTests();
  }, []);

  const getTests = async (): Promise<void> => {
    const result = await getAttemptedTests();
    if (result?.data && result.data.length > 0) setData(result);
  };

  const itemBase =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer w-full";
  const itemInactive = darkMode
    ? "text-gray-400 hover:text-white hover:bg-gray-800/60"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  const itemActive = darkMode
    ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
    : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]";

  const sectionLabel = `px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wider ${
    darkMode ? "text-gray-500" : "text-gray-400"
  }`;
  const divider = darkMode ? "border-gray-800" : "border-gray-200";

  return (
    <div className="min-w-screen max-w-screen  flex flex-row justify-end">
      {/* Sidebar */}
      <aside
        className={`w-64 min-h-screen fixed left-0 top-0 pt-16 flex flex-col border-r ${
          darkMode
            ? "bg-[#0c0c0c] border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {/* Quick links */}
          <Link href="/" className={`${itemBase} ${itemInactive}`}>
            <Home className="w-4 h-4 shrink-0" />
            Home
          </Link>

          {/* Overview section */}
          <p className={sectionLabel}>Overview</p>
          <button onClick={() => setActive(0)} className={`${itemBase} ${active === 0 ? itemActive : itemInactive}`}>
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </button>
          <button onClick={() => setActive(1)} className={`${itemBase} ${active === 1 ? itemActive : itemInactive}`}>
            <ClipboardList className="w-4 h-4 shrink-0" />
            Tests Attempted
          </button>

          {/* Assessments section */}
          <p className={sectionLabel}>Assessments</p>
          <Link href="/all-tests" className={`${itemBase} ${itemInactive}`}>
            <ListChecks className="w-4 h-4 shrink-0" />
            All Tests
          </Link>
          <Link href="/explore" className={`${itemBase} ${itemInactive}`}>
            <Compass className="w-4 h-4 shrink-0" />
            Explore
          </Link>
        </nav>

        {/* Footer / Logout */}
        <div className={`px-3 py-4 border-t ${divider}`}>
          <Link
            href="/logout"
            className={`${itemBase} ${
              darkMode
                ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="pt-20 flex-1 ml-64  bg-white text-black dark:bg-black dark:text-white">
        {active === 0 && <DashBoardView data={data} />}
        {active === 1 && <TestsAttempted data={data} />}
      </main>
    </div>
  );
};

export default Dashboard;
