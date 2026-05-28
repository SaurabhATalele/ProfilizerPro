"use client";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import EditModal from "./EditModal";
import { updateAssignment } from "@/Utils/Apicalls/UpdateAssignment";
import DeleteTest from "./DeleteTest";
import { ToastContainer } from "react-toastify";

const AddTest = () => {
  const [tests, setTests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [modalData, setModalData] = useState({});
  const [seletedTest, setSelectedTest] = useState();

  useEffect(() => {
    const getTests = async () => {
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
        refresh={setRefresh}
        openModal={openModal}
        data={modalData}
        setOpenModal={setOpenModal}
      />
      <h1 className="py-5 text-lg font-bold">All tests</h1>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg w-3/4">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                Icon
              </th>
              <th scope="col" class="px-6 py-3">
                Test Name
              </th>
              <th scope="col" class="px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tests &&
              tests.map((test) => {
                return (
                  <tr key={test._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="flex items-center px-5">
                      <div class="flex-shrink-0">
                        <img
                          className="w-8 h-8 rounded-full"
                          src={test.icon}
                          alt="Neil image"
                        />
                      </div>
                    </td>
                    <th
                      scope="row"
                      class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {test.name}
                    </th>

                    <td class="px-6 py-4 text-right flex justify-center">
                      {/* <div className="flex items-center group relative ">
                        <button
                          className="text-xl font-light"
                          onClick={() => {
                            setModalData(test);
                            setOpenEditModal(true);
                          }}
                        >
                          <img
                            width="30"
                            height="30"
                            src="https://img.icons8.com/fluency-systems-regular/48/pen-squared.png"
                            alt="filled-trash"
                            className="w-6"
                          />
                          <p className="absolute -left-10 top-0 hidden group-hover:block px-2 py-1 bg-white text-sm font-light rounded-md border">
                            Edit
                          </p>
                        </button>
                      </div> */}
                      <div className="flex items-center group relative">
                        {/* <button
                          className="text-sm font-light"
                          onClick={() => {
                            handleDelete(test._id);
                          }}
                        >
                          <img
                            width="24"
                            height="24"
                            src="https://img.icons8.com/fluency-systems-regular/48/ff0000/filled-trash.png"
                            alt="filled-trash"
                          />
                          <p className="absolute left-8 top-0 hidden group-hover:block px-2 py-1 bg-white text-sm font-light rounded-md border  text-red-400">
                            Delete
                          </p>
                        </button> */}

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
