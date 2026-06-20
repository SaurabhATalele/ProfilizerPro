"use client";
import { FC, useEffect, useState } from "react";
import AdminNavbar from "@/Components/Navbar/Admin";
import AdminDashboard from "@/Components/Admin/DashBoard";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";

interface UserData {
  username?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

const Page: FC = () => {
  const [user, setUser] = useState<UserData>({});
  const router = useRouter();

  useEffect(() => {
    const cookie = localStorage.getItem("token");
    if (!cookie) {
      router.push("/login");
    } else {
      const getUserHandler = async () => {
        const resp = await getUser();
        if (resp === false) {
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
    <div className="max-w-screen flex justify-center py-24">
      {user.isAdmin && (
        <>
          <AdminNavbar />
          <AdminDashboard />
        </>
      )}
    </div>
  );
};

export default Page;
