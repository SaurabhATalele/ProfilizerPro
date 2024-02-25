import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ViewTest = ({ test }) => {
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const selectedTopics = useState([]);
  useEffect(() => {
    const fetchTopics = async () => {
      const res = await fetch(`/api/v1/assignment`);
      const data = await res.json();
      setTopics(data.data[0]);
      setSubtopics(data.data[0].topics);
    };
    fetchTopics();
  }, []);

  

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
                  <li className="flex flex-col gap-1">
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        name="tech1"
                        id="tech 1"
                        className="h-4 w-4 "
                       
                      />
                      <label htmlFor="tech1" className="text-md font-semibold">
                        {topic.name}
                      </label>
                    </div>
                    <div className="flex gap-3 items-center radio-grp">
                      {Array.from(
                        { length: topic.maxQuestions - topic.minQuestions + 1 },
                        (_, i) =>
                          i + (topic.maxQuestions - topic.minQuestions) + 1
                      ).map((i) => (
                        <>
                          <input
                            type="radio"
                            name="tech1"
                            id={i}
                            className="h-4 w-4"
                          />
                          <label htmlFor="tech1-1" className="text-sm">
                            {i}
                          </label>
                        </>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
            <Link href={`/test/${test}/attempt`}>
              <button className="bg-blue-500 text-white p-2 rounded-md absolute bottom-0 ">
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
