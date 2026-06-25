"use client";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "./Skeleton";
import { ArrowRight } from "lucide-react";
import { DesignTestTile } from "../Admin/Tests/DesignTestTile";
import JDGeneratorTile from "../JDGenerator/JDGeneratorTile";
import { BASE_BACKEND_URL } from "@/Utils/constants";

interface TestData {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

interface CardProps {
  tests: TestData[];
}

const Card: FC<CardProps> = ({ tests }) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
      {tests.map((test, index) => (
        <div
          key={test._id}
          className={`relative flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
            index >= 2 ? "xl:hidden" : ""
          } ${index >= 3 ? "hidden" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2">
              <Image
                src={test.icon}
                width={60}
                height={60}
                alt={test.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight break-words min-w-0">
              {test.name}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mt-2 leading-relaxed break-words overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {test.description}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link href={`/test/${test._id}`} className="w-full block">
              <button className="w-full bg-[var(--color-primary)] hover:bg-opacity-90 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all shadow-md shadow-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/40 flex items-center justify-center">
                Take Assessment
              </button>
            </Link>
          </div>
        </div>
      ))}

      {/* Design Your Own Test tile */}
      <DesignTestTile/>

      {/* JD Question Generator tile */}
      <JDGeneratorTile/>
    </div>
  );
};

const TestProvide: FC = () => {
  const [tests, setTests] = useState<TestData[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_BACKEND_URL}/api/v1/assignment`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            setTests(data.data.slice(0, 3));
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch tests, using sample data");
      }

      setTests([
        {
          _id: "sample1",
          name: "Software Engineering Aptitude",
          description: "Evaluate your problem-solving skills, logical reasoning, and basic algorithmic thinking required for software engineering roles.",
          icon: "/LandingImage/tech.svg",
        },
        {
          _id: "sample2",
          name: "Logical Reasoning Assessment",
          description: "Challenge your analytical thinking with patterns, sequences, and critical reasoning scenarios. Perfect for any analytical role.",
          icon: "/LandingImage/Logical.svg",
        },
        {
          _id: "sample3",
          name: "General Cognitive Ability",
          description: "A comprehensive test to measure your general learning aptitude, verbal ability, and quantitative reasoning.",
          icon: "/LandingImage/GenAss.svg",
        },
      ]);
    })();
  }, []);

  return (
    <div className="w-[90%] lg:w-3/4 w-1/2 rounded-md flex flex-col items-center px-5 md:px-10 py-5 gap-10">
      <div className="w-full flex justify-between items-end">
        <h1 className="text-[1.5rem] font-bold">Tests We provide</h1>
        <Link href="/all-tests" className="flex gap-2 items-center font-light text-[var(--color-primary)] dark:text-white hover:text-[var(--color-secondary)]  text-sm">
          Explore More 
          <ArrowRight className="w-4"/>
        </Link>
      </div>

      {tests.length === 0 ? <Skeleton /> : <Card tests={tests} />}
    </div>
  );
};

export default TestProvide;
