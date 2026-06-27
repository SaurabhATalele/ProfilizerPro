"use client";
import { FC, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getUser } from "@/Utils/Apicalls/User";
import { getNavTree } from "@/Utils/Apicalls/InterviewPrep";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";
import NavTree from "./NavTree";

interface InterviewDeskLayoutProps {
  children: ReactNode;
}

/**
 * The "Interview Desk" reader shell: a sidebar (note count + live search +
 * nav tree) beside the content pane. It sits beneath the global app Navbar —
 * the feature has no navbar of its own. Gates client-side on the JWT (any
 * authenticated user) and fetches the nav tree once.
 */
const InterviewDeskLayout: FC<InterviewDeskLayoutProps> = ({ children }) => {
  const router = useRouter();

  const [authed, setAuthed] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<NavTreeSubject[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingTree, setLoadingTree] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("");

  // Auth gate (no isAdmin check — any authenticated user reaches the desk).
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const confirm = async (): Promise<void> => {
      const resp = await getUser();
      if (!resp) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      const data = await resp.json();
      if (data === false || !data?.username) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setAuthed(true);
    };
    confirm();
  }, [router]);

  // Fetch the nav tree once, after auth is confirmed.
  useEffect(() => {
    if (!authed) return;
    const load = async (): Promise<void> => {
      setLoadingTree(true);
      const resp = await getNavTree();
      if (resp && resp.ok) {
        const data: { subjects: NavTreeSubject[]; totalPages: number } =
          await resp.json();
        setSubjects(data.subjects ?? []);
        setTotalPages(data.totalPages ?? 0);
      }
      setLoadingTree(false);
    };
    load();
  }, [authed]);

  if (!authed) return null;

  return (
    // pt-16 clears the fixed global Navbar (h-16).
    <div className="flex min-h-screen bg-white pt-16 text-black dark:bg-black dark:text-white">
      {/* Sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-800 md:flex">
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">
          <span className="text-sm font-bold leading-tight">Interview Desk</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {totalPages} Note{totalPages === 1 ? "" : "s"}
          </span>
        </div>

        <div className="px-3 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212]"
            />
          </div>
        </div>

        <div className="flex-1 px-2 pb-6">
          {loadingTree ? (
            <div className="flex flex-col gap-2 px-2 py-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-7 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <NavTree subjects={subjects} filter={filter} />
          )}
        </div>
      </aside>

      {/* Content pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile search (the sidebar is hidden on small screens) */}
        <div className="px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-primary)] dark:border-gray-700 dark:bg-[#121212]"
            />
          </div>
          {filter.trim() && (
            <div className="mt-2 max-h-64 overflow-y-auto">
              <NavTree subjects={subjects} filter={filter} />
            </div>
          )}
        </div>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InterviewDeskLayout;
