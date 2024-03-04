"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Topic from "./Topic";

const ViewTest = ({ test }) => {
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});

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
      console.log(data.data);
      setTopics(data.data);
      setSubtopics(data.data?.topics);
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    console.log(selectedTopics);
  }, [selectedTopics]);

  const handleButtonClick = () => {
    // Serialize the JSON data and pass it as a query parameter
    const serializedData = encodeURIComponent(JSON.stringify(selectedTopics));
    router.push(`/destinationPage?name=${test}&data=${serializedData}`);
  };

  return (
    <div className="pt-24 w-3/4 flex justify-between ">
      {topics && (
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
                <h1 className="text-2xl font-bold">{topics.name}</h1>
              </div>
              <p className="text-lg p-10 text-justify">{topics.description} </p>
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
            <Link
              href={{
                pathname: "/resetpass",
              }}
            >
              <button
                className="bg-blue-500 text-white p-2 rounded-md absolute bottom-0 "
                onClick={() => console.log(selectedTopics)}
              >
                Start Test
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewTest;
