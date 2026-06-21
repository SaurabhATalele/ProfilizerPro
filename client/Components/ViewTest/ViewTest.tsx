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
    <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex justify-center px-5 py-10">
      {topic && (
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header banner */}
            <div className="relative px-8 pt-10 pb-8 text-center border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent dark:from-[var(--color-secondary)]/10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-md ring-1 ring-gray-100 dark:ring-gray-700 mb-4 p-3">
                <Image
                  width={80}
                  height={80}
                  alt={topic.name}
                  className="w-full h-full object-contain"
                  src={topic.icon}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {topic.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                {topic.description}
              </p>
            </div>

            {/* Topic selection */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-5">
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

              <ul className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1">
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

            {/* Footer action */}
            <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasSelection
                  ? "You're ready to begin."
                  : "Select at least one topic to start."}
              </p>
              <button
                onClick={handleButtonClick}
                disabled={!hasSelection}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-md shadow-[var(--color-primary)]/20 dark:shadow-[var(--color-secondary)]/20 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                Start Test
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTest;
