"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const TestProvide = () => {
  const [tests, setTests] = useState([]);

  const getTests = async () => {
    try {
      const res = await axios.get("/api/v1/assignment");
      setTests(res.data.data.slice(0,3));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getTests();
    console.log(tests);
  }, []);
  return (
    <div className="w-3/4  bg-white  rounded-md flex flex-col items-center px-10 py-5 gap-10">
      <div className="w-full flex justify-between items-end">
        <h1 className="text-[1.5rem] font-bold">Tests We provide </h1>
        <Link href={"/"} className="font-light text-primary-light text-sm">
          Explore More
        </Link>
      </div>
      {card(tests)}
    </div>
  );
};

const card = (tests) => {
  return (
    <div className="w-full grid grid-cols-3 gap-3 justify-around items-center">
      {tests &&
        tests.map((test) => (
          <div className="h-80 flex flex-col flex-grow-0 items-center gap-4 rounded-md shadow-md p-4">
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
      {/* <div className="flex flex-col items-center w-80 gap-4 rounded-md shadow-md p-4">
        <Image
          src={"https://img.icons8.com/color/240/java-coffee-cup-logo--v1.png"}
          width={120}
          height={120}
          alt="General"
          className="w-24 h-24"
        />
        <p className="font-bold text-lg ">Java</p>
        <p className="text-sm text-gray-500">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint,
          placeat ex eos sequi debitis, odit quasi quas libero expedita illum,
          quisquam neque quod quibusdam eius.
        </p>
        <button className="bg-primary-light text-white p-2 rounded-md text-sm">
          Attempt
        </button>
      </div> */}
    </div>
  );
};

export default TestProvide;
