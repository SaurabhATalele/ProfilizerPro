"use client";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";
import SubjectGrid from "@/Components/InterviewPrep/SubjectGrid";

/**
 * Interview Prep home — the subject tile grid (wireframe view). Renders under
 * the global app Navbar (no feature-specific navbar). Gates client-side on the
 * JWT; any authenticated user may browse.
 */
const Page: FC = () => {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean>(false);

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

  if (!authed) return null;

  // pt-16 clears the fixed global Navbar (h-16).
  return (
    <div className="min-h-screen bg-white pt-16 text-black dark:bg-black dark:text-white">
      <SubjectGrid />
    </div>
  );
};

export default Page;
