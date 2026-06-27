"use client";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";
import { useTheme } from "@/Utils/ThemeContext";
import AdminNavbar from "@/Components/Navbar/Admin";
import InterviewPrepAdmin from "@/Components/Admin/InterviewPrepEditor/InterviewPrepAdmin";

interface UserData {
  username?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

/**
 * Admin-only authoring console for the Interview Prep library. Gates on the
 * `isAdmin` flag (non-admins are redirected home), mirroring the admin page.
 */
const Page: FC = () => {
  const { darkMode } = useTheme();
  const [user, setUser] = useState<UserData>({});
  const router = useRouter();

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
      if (data === false) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (data.username && data.isAdmin) {
        setUser(data);
      } else {
        router.push("/");
      }
    };
    confirm();
  }, [router]);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
        {user.isAdmin && (
          <>
            <AdminNavbar />
            <div className="pt-20">
              <InterviewPrepAdmin />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
