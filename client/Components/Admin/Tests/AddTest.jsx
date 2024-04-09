"use client";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const AddTest = () => {
  const [tests, setTests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getTests = async () => {
      try {
        const res = await fetch("/api/v1/assignment");
        const data = await res.json();
        console.log(data);
        setTests(data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTests();
  }, [refresh]);

  return (
    <div className="w-full xl:w-3/4">
      <Modal
        refresh={setRefresh}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
      <h1 className="py-5 text-lg font-bold">All tests</h1>
      <ul className="w-2/3 divide-y divide-gray-200 dark:divide-gray-700">
        {tests &&
          tests.map((test) => (
            <li class="pb-3 sm:pb-4" key={test._id}>
              <div class="flex items-center space-x-4 rtl:space-x-reverse">
                <div class="flex-shrink-0">
                  <img
                    class="w-8 h-8 rounded-full"
                    src={test.icon}
                    alt="Neil image"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {test.name}
                  </p>
                </div>
                <div class="inline-flex gap-2 items-center text-base font-semibold text-gray-900 dark:text-white">
                  {/* <button className="hover:bg-violet-500 px-2 py-1 text-primary-light rounded-md text-sm font-light">
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/fluency-systems-regular/48/252525/pen-squared.png"
                      alt="pen-squared"
                    />
                  </button> */}
                  <button className="text-sm font-light">
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/fluency-systems-regular/48/ff0000/filled-trash.png"
                      alt="filled-trash"
                    />
                  </button>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AddTest;
