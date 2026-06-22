"use client";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface CustomTest {
  _id: string;
  name: string;
  icon: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  customSubtopics?: { name: string; questionCount: number }[];
}

const CustomTests: FC = () => {
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustom = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch("/api/v1/assignment/custom", {
          method: "GET",
          headers: { Authorization: token },
        });
        if (res.ok) {
          const payload = await res.json();
          if (Array.isArray(payload?.data)) {
            setTests(payload.data);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustom();
  }, []);

  // Hide the section entirely when there are no custom tests (or still loading).
  if (loading || tests.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[var(--color-primary)] dark:text-[var(--color-secondary)]" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Custom Tests
        </h2>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          Recent {tests.length}
        </span>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {tests.map((test) => (
          <div
            key={test._id}
            className="relative flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2">
                <Image
                  src={test.icon}
                  width={60}
                  height={60}
                  alt={test.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  {test.name}
                </h3>
                {test.difficulty && (
                  <span className="w-fit text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] dark:bg-[var(--color-secondary)]/15 dark:text-[var(--color-secondary)]">
                    {test.difficulty}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1 mt-2 leading-relaxed">
              {test.customSubtopics && test.customSubtopics.length > 0
                ? test.customSubtopics.map((s) => s.name).join(", ")
                : "Custom assessment"}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link href={`/explore?id=${test._id}`} className="w-full block">
                <button className="w-full bg-[var(--color-primary)] hover:bg-opacity-90 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all shadow-md shadow-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/40 flex items-center justify-center gap-1.5">
                  Customize & Attempt
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomTests;
