"use client";
import  { FC, useState, useEffect } from "react";
import Card from "./Card";
import CustomTests from "./CustomTests";
import axios from "axios";
import Skeleton from "../Landing/Skeleton";
import JDGeneratorTile from "../JDGenerator/JDGeneratorTile";

interface Test {
  _id: string;
  name: string;
  icon: string;
  description: string;
}

const AllTests: FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getTests = async (): Promise<void> => {
    try {
      const res = await axios.get("/api/v1/assignment");
      if (res.data && res.data.data) {
        setTests(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTests();
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col px-5 py-10 max-w-7xl mx-auto gap-8">
      <div className="w-full flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">
          All Assessments
        </h1>
      </div>

      {loading ? <Skeleton /> : <Card tests={tests} />}

      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        <JDGeneratorTile />
      </div>

      <CustomTests />
    </div>
  );
};

export default AllTests;
