"use client";
import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import React from "react";

export default function DeleteTest() {
  const [openDeleteBox, setOpenDeleteBox] = useState(false);
  return (
    <>
      <div className=" relative flex  justify-center  items-center">
        <Button onClick={() => setOpenDeleteBox(true)}>
          {" "}
          <img
            width="24"
            height="24"
            src="https://img.icons8.com/fluency-systems-regular/48/ff0000/filled-trash.png"
            alt="filled-trash"
          />
        </Button>
        <Modal
          show={openDeleteBox}
          size="md"
          onClose={() => setOpenDeleteBox(false)}
          popup
          className=" self-center   dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 z-50"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center  ">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this Test?
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  className=" bg-red-700"
                  onClick={() => setOpenDeleteBox(false)}
                >
                  {"Yes, I'm sure"}
                </Button>
                <Button color="gray" onClick={() => setOpenDeleteBox(false)}>
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
