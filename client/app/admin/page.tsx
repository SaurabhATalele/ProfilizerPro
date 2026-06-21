"use client";
import { FC, useEffect, useState } from "react";
import AdminNavbar from "@/Components/Navbar/Admin";
import AdminDashboard from "@/Components/Admin/DashBoard";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";
import { useTheme } from "@/Utils/ThemeContext";

interface UserData {
  username?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

const Page: FC = () => {
  const { darkMode } = useTheme();
  const [user, setUser] = useState<UserData>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const getUserHandler = async () => {
        const resp = await getUser();
        if (!resp) {
          localStorage.removeItem("token");
          return;
        }
        const userData = await resp.json();
        if (userData === false) {
          localStorage.removeItem("token");
          return;
        }
        if (userData.username && userData.isAdmin) {
          setUser(userData);
        } else {
          router.push("/");
        }
      };
      getUserHandler();
    }
  }, [router]);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="max-w-screen min-h-screen flex justify-center bg-white text-black dark:bg-black dark:text-white">
        {user.isAdmin && (
          <>
            <AdminNavbar />
            <AdminDashboard />
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
