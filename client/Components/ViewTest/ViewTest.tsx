"use client";
import { FC, useEffect, useState, useContext } from "react";
import Image from "next/image";
import TopicContext from "../../Utils/TestContext";
import Topic from "./Topic";
import { useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";
import { ListChecks, ArrowRight } from "lucide-react";

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
  const [_user, setUser] = useState<User>({});
  const [subtopics, setSubtopics] = useState<SubTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string>>({});
  const [_topicState, setTopicState] = useState<boolean>(false);
  const {  setTopics } = useContext(TopicContext) as TopicContextType;
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
      router.push(`/test/attempt/${test}`);
    }
  };

  const hasSelection = Object.keys(selectedTopics).length > 0;

  return (
    <div className="w-full min-h-screen pt-20 pb-24 px-5">
      {topic && (
        <div className="w-full max-w-2xl mx-auto py-10">
          {/* Header */}
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 flex items-center justify-center p-2">
              <Image
                width={60}
                height={60}
                alt={topic.name}
                className="w-full h-full object-contain"
                src={topic.icon}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {topic.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {topic.description}
              </p>
            </div>
          </div>

          {/* Topic selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-[var(--color-primary)] dark:text-[var(--color-secondary)]" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Select your topics
              </h2>
              {hasSelection && (
                <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 dark:bg-[var(--color-secondary)]/15 text-[var(--color-primary)] dark:text-[var(--color-secondary)]">
                  {Object.keys(selectedTopics).length} selected
                </span>
              )}
            </div>

            <ul className="flex flex-col gap-3">
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
        </div>
      )}

      {/* Sticky bottom action bar */}
      {topic && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasSelection
                ? `${Object.keys(selectedTopics).length} topic${Object.keys(selectedTopics).length > 1 ? "s" : ""} selected — ready to go.`
                : "Select at least one topic to start."}
            </p>
            <button
              onClick={handleButtonClick}
              disabled={!hasSelection}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-medium text-sm px-6 py-3 rounded-lg shadow-md shadow-[var(--color-primary)]/20 dark:shadow-[var(--color-secondary)]/20 transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Test
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;
