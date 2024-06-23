"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopicContext from "../../Utils/TestContext";
import { useEffect, useState, useContext } from "react";
import Topic from "./Topic";
import { redirect, useRouter } from "next/navigation";
import { getUser } from "@/Utils/Apicalls/User";

const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

const ViewTest = ({ test }) => {
  const [topic, setTopic] = useState([]);
  const [user, setUser] = useState({});
  const [subtopics, setSubtopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});
  const [topicState, setTopicState] = useState(false);
  const { topics, setTopics } = useContext(TopicContext);
  const router = useRouter();
  useEffect(() => {
    const fetchTopics = async () => {
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

    const getUserHandler = async () => {
      const resp = await getUser();
      const user = await resp.json();
      console.log(user);
      if (user === false) {
        localStorage.removeItem("token");
        return;
      }
      if (user.username) {
        setUser(user);
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

  const handleButtonClick = () => {
    if (Object.keys(selectedTopics).length === 0)
      alert("Please select at least one topic");
    else {
      setTopics({ topic: topic.name, subtopics: selectedTopics });
      console.log("ebsdbksdf");
      router.push(`/test/attempt/${test}`);
    }
  };

  return (
    <div className="pt-24 w-3/4 flex justify-center flex-col">
      {topic && (
        <div className="flex justify-center gap-5">
          <div class="w-full h-fit gap-5 p-5 max-w-lg bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div class="flex flex-col items-center pb-10">
              <Image
                width={150}
                height={150}
                alt="Tehnology Icon"
                className="w-24 h-24 mb-3 rounded-full shadow-lg"
                src={topic.icon}
              />

              <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                {topic.name}
              </h5>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {topic.description}
              </span>
            </div>

            <div className="m-3 overflow-y-auto flex flex-col gap-3 relative overflow-auto">
              <h2 className="text-xl font-semibold">
                Select topics of your choice
              </h2>
              <ul className="flex flex-col gap-5">
                {subtopics &&
                  subtopics.map((topic) => (
                    <Topic
                      key={topic._id}
                      name={topic.name}
                      minQuestions={topic.minQuestions}
                      maxQuestions={topic.maxQuestions}
                      setSelectedTopics={setSelectedTopics}
                    />
                  ))}
              </ul>

              {/* <Link href={`/test/attempt/${test}`}> */}
              {/* </Link> */}
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
