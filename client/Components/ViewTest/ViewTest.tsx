"use client";
import React, { FC, useEffect, useState, useContext } from "react";
import Image from "next/image";
import TopicContext from "../../Utils/TestContext";
import Topic from "./Topic";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";

interface SubTopic {
  _id: string;
  name: string;
  minQuestions: number;
  maxQuestions: number;
}

interface TopicData {
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

interface TopicContextType {
  topics: {
    topic: string;
    subtopics: Record<string, string>;
  };
  setTopics: (value: { topic: string; subtopics: Record<string, string> }) => void;
}

interface ViewTestProps {
  test: string;
}

const isEmptyObject = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

const ViewTest: FC<ViewTestProps> = ({ test }) => {
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [user, setUser] = useState<User>({});
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string>>({});
  const [topicState, setTopicState] = useState<boolean>(false);
  const { topics, setTopics } = useContext(TopicContext) as TopicContextType;
  const router = useRouter();

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
    console.log(selectedTopics);
    setTopicState(!isEmptyObject(selectedTopics));
  }, [selectedTopics]);

  const handleButtonClick = (): void => {
    if (Object.keys(selectedTopics).length === 0)
      alert("Please select at least one topic");
    else {
      setTopics({ topic: topic?.name || "", subtopics: selectedTopics });
      console.log("ebsdbksdf");
      router.push(`/test/attempt/${test}`);
    }
  };

  return (
    <div className="pt-24 w-3/4 flex justify-center flex-col">
      {topic && (
        <div className="flex justify-center gap-5">
          <div className="w-full h-fit gap-5 p-5 max-w-lg bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center pb-10">
              <Image
                width={150}
                height={150}
                alt="Technology Icon"
                className="w-24 h-24 mb-3 rounded-full shadow-lg"
                src={topic.icon}
              />

              <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                {topic.name}
              </h5>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {topic.description}
              </span>
            </div>

            <div className="m-3 overflow-y-auto flex flex-col gap-3 relative overflow-auto">
              <h2 className="text-xl font-semibold">
                Select topics of your choice
              </h2>
              <ul className="flex flex-col gap-5">
                {subtopics &&
                  subtopics.map((topicItem) => (
                    <Topic
                      key={topicItem._id}
                      name={topicItem.name}
                      minQuestions={topicItem.minQuestions}
                      maxQuestions={topicItem.maxQuestions}
                      setSelectedTopics={setSelectedTopics}
                    />
                  ))}
              </ul>
            </div>
            <button
              className="my-5 bg-primary-light w-fit px-4 py-2 mx-auto text-white text-sm p-2 rounded-md  disabled:bg-gray-400"
              onClick={() => handleButtonClick()}
            >
              Start Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;
