"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

import Image from "next/image";

const Card = () => {
  const [tests, setTests] = useState([]);

  const getTests = async () => {
    try {
      const res = await axios.get("/api/v1/assignment");
      setTests(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getTests();
    console.log(tests);
  }, []);
  return (
    <div className="w-full grid grid-cols-3 gap-3 justify-around items-center">
      {tests &&
        tests.map((test) => (
          <div key={test._id} className="h-80 flex flex-col flex-grow-0 items-center gap-4 rounded-md shadow-md p-4">
            <Image
              src={test.icon}
              width={120}
              height={120}
              alt="General"
              className="w-24 h-24"
            />
            <p className="font-bold text-lg ">{test.name}</p>
            <p className="text-sm text-gray-500 line-clamp-3 text-justify w-full">
              {test.description}
            </p>
            <Link href={`/test/${test._id}`}>
              <button className="bg-primary-light text-white p-2 rounded-md text-sm">
                Attempt
              </button>
            </Link>
          </div>
        ))}
    </div>
  );
};
export default Card;
