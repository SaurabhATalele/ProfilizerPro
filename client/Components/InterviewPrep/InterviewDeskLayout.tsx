"use client";
import { FC, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import type { NavTreeSubject } from "@/Utils/types/InterviewPrep";
import NavTree from "./NavTree";

interface InterviewDeskLayoutProps {
  /** Nav tree + count provided by the statically rendered (ISR) page. */
  subjects: NavTreeSubject[];
  totalPages: number;
  children: ReactNode;
}

/**
 * The "Interview Desk" reader shell: a sidebar (note count + live search +
 * nav tree) beside the content pane, under the global app Navbar. The tree is
 * supplied by the statically generated page (no client fetch), so only the
 * search filter is client state.
 */
const InterviewDeskLayout: FC<InterviewDeskLayoutProps> = ({
  subjects,
  totalPages,
  children,
}) => {
  const [filter, setFilter] = useState<string>("");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const pathname = usePathname();

  // Close the mobile tree after navigating to a note.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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
          <NavTree subjects={subjects} filter={filter} />
        </div>
      </aside>

      {/* Content pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile nav toggle (the sidebar is hidden on small screens) */}
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-expanded={mobileNavOpen}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
          >
            {mobileNavOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            Browse notes
            <span className="text-xs text-gray-400">
              ({totalPages})
            </span>
          </button>
        </div>

        {/* Mobile tree drawer: search + full tree, always reachable. */}
        {mobileNavOpen && (
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800 md:hidden">
            <div className="relative mb-2">
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
            <div className="max-h-[60vh] overflow-y-auto">
              <NavTree subjects={subjects} filter={filter} />
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InterviewDeskLayout;
