"use client";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";
import ReviewWizard from "@/Components/JDGenerator/ReviewWizard";

interface UserData {
  username?: string;
  [key: string]: unknown;
}

/**
 * Top-level authenticated page for the JD Question Generator. Gates client-side
 * by reading the JWT `token` from localStorage (redirecting to `/login` when
 * absent) and confirming the session via `getUser()`. Unlike the admin page,
 * there is NO `isAdmin` check — any authenticated user reaches the wizard.
 */
const Page: FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const confirmSession = async (): Promise<void> => {
      const resp = await getUser();
      if (!resp) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      const userData = await resp.json();
      if (userData === false || !userData?.username) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setUser(userData);
    };

    confirmSession();
  }, [router]);

  if (!user) return null;

  return <ReviewWizard />;
};

export default Page;
