"use client";
import React from "react";
import AddTest from "../../Components/Admin/Tests/AddTest";
import AdminNavbar from "../../Components/Navbar/Admin";
import AdminDashboard from "../../Components/Admin/DashBoard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/Utils/Apicalls/User";

const Page = () => {
  const [user, setUser] = useState({});

  const router = useRouter();

  useEffect(() => {
    const cookie = localStorage.getItem("token");
    if (!cookie) {
      router.push("/login");
    } else {
      const getUserHandler = async () => {
        const resp = await getUser();
        const user = await resp.json();
        if (user === false) {
          localStorage.removeItem("token");
          return;
        }
        if (user.username && user.isAdmin) {
          setUser(user);
        } else {
          router.push("/");
        }
      };

      const cookie = localStorage.getItem("token");
      if (cookie) {
        getUserHandler();
      }
    }
  }, []);
  return (
    <div className="max-w-screen flex justify-center py-24">
      {user.isAdmin && (
        <>
          <AdminNavbar />
          <AdminDashboard />
          {/* <AddTest /> */}
        </>
      )}
    </div>
  );
};

export default Page;
