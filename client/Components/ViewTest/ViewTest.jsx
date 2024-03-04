"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopicContext from "../../Utils/TestContext";
import { useEffect, useState, useContext } from "react";
import Topic from "./Topic";

const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

const ViewTest = ({ test }) => {
  const [topic, setTopic] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});
  const [topicState, setTopicState] = useState(false);
  const { topics, setTopics } = useContext(TopicContext);
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
    fetchTopics();
  }, []);

  useEffect(() => {
    console.log(selectedTopics);
    setTopicState(!isEmptyObject(selectedTopics));
  }, [selectedTopics]);

  return (
    <div className="pt-24 w-3/4 flex justify-between ">
      {topic && (
        <>
          <div className="m-3 w-1/2 border-r border-r-gray-400 min-h-[50vh]">
            <div className="flex flex-col gap-10 items-center">
              <div className="w-full flex items-center justify-start">
                <Image
                  width={150}
                  height={150}
                  alt="Tehnology Icon"
                  src={topics.icon}
                />
                <h1 className="text-2xl font-bold">{topic.name}</h1>
              </div>
              <p className="text-lg p-10 text-justify">{topic.description} </p>
            </div>
          </div>
          <div className="m-3 w-1/2  flex flex-col gap-3 relative overflow-auto">
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
            {topicState && (
              <Link href={`/test/attempt/${test}`}>
                <button
                  className="bg-blue-500 text-white p-2 rounded-md absolute bottom-0 disabled:bg-gray-400"
                 
                  onClick={() =>
                    setTopics({ topic: topic.name, subtopics: selectedTopics })
                  }
                >
                  Start Test
                </button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewTest;
