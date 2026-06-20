"use client";
import  { FC, useEffect, useState } from "react";
import Modal from "./Modal";
import DeleteTest from "./DeleteTest";
import { ToastContainer } from "react-toastify";

interface Topic {
  name: string;
}

interface Test {
  _id: string;
  name: string;
  icon: string;
  description: string;
  topics: Topic[];
}

const AddTest: FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [modalData, _setModalData] = useState<Partial<Test>>({});

  useEffect(() => {
    const getTests = async (): Promise<void> => {
      try {
        const res = await fetch("/api/v1/assignment");
        const data = await res.json();
        setTests(data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getTests();
  }, [refresh]);

  return (
    <div className="w-full xl:w-3/4">
      <ToastContainer />
      <Modal
        setRefresh={setRefresh}
        refresh={refresh}
        openModal={openModal}
        data={modalData}
        setOpenModal={setOpenModal}
      />
      <h1 className="py-5 text-lg font-bold">All tests</h1>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg w-3/4">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Icon
              </th>
              <th scope="col" className="px-6 py-3">
                Test Name
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tests &&
              tests.map((test) => {
                return (
                  <tr
                    key={test._id}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <img
                          className="w-8 h-8 rounded-full"
                          src={test.icon}
                          alt="Test icon"
                        />
                      </div>
                    </td>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {test.name}
                    </th>

                    <td className="px-6 py-4 text-right flex justify-center">
                      <div className="flex items-center group relative">
                        <DeleteTest
                          id={test._id}
                          refresh={refresh}
                          setRefresh={setRefresh}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddTest;
