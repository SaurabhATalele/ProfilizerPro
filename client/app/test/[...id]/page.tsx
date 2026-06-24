"use client";
import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ViewTest from "@/Components/ViewTest/ViewTest";
import { useTheme } from "@/Utils/ThemeContext";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";


export interface SubTopic {
  _id: string;
  name: string;
  minQuestions: number;
  maxQuestions: number;
}

export interface TopicData {
  name: string;
  icon: string;
  description: string;
  topics: SubTopic[];
}

interface User {
  username?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

const Page: FC = () => {
  const [topic, setTopic] = useState<TopicData>({ name: '', icon: "", description: "", topics: [] });
  const [_user, setUser] = useState<User>({});
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const { darkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const id = pathname.split("/").filter((x) => x);
  const test = id[id.length - 1];

  useEffect(() => {
    const fetchTopics = async (): Promise<void> => {
      const res = await fetch(`/api/v1/assignment/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: test }),
      });
      const data = await res.json();
      setTopic(data.data);
      setSubtopics(data.data.topics);
    };

    const getUserHandler = async (): Promise<void> => {
      const resp = await getUser();
      const userData = await resp.json();
      console.log(userData);
      if (userData === false) {
        localStorage.removeItem("token");
        return;
      }
      if (userData.username) {
        setUser(userData);
      }
    };

    const cookie = localStorage.getItem("token");
    if (cookie) {
      getUserHandler();
    } else {
      router.push("/login");
    }
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchTopics = async (): Promise<void> => {
      const res = await fetch(`/api/v1/assignment/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: test }),
      });
      const data = await res.json();
      setTopic(data.data);
      setSubtopics(data.data.topics);
    };

    const getUserHandler = async (): Promise<void> => {
      const resp = await getUser();
      const userData = await resp.json();
      console.log(userData);
      if (userData === false) {
        localStorage.removeItem("token");
        return;
      }
      if (userData.username) {
        setUser(userData);
      }
    };

    const cookie = localStorage.getItem("token");
    if (cookie) {
      getUserHandler();
    } else {
      router.push("/login");
    }
    fetchTopics();
  }, []);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="w-full flex justify-center px-10 bg-white text-black dark:bg-black dark:text-white min-h-screen">
        <ViewTest test={test} topic={topic} subtopics={subtopics} />
      </div>
    </div>
  );
};

export default Page;
