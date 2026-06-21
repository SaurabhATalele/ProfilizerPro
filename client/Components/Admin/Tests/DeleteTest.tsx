"use client";
import  { FC, useState } from "react";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Toast from "@/Utils/Toast";
import { Trash } from "lucide-react";

interface DeleteTestProps {
  id: string;
  refresh: boolean;
  setRefresh: (value: boolean) => void;
}

const DeleteTest: FC<DeleteTestProps> = ({ id, refresh, setRefresh }) => {
  const [openDeleteBox, setOpenDeleteBox] = useState<boolean>(false);

  const handleDelete = async (testId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/v1/assignment/`, {
        method: "DELETE",
        body: JSON.stringify({ id: testId }),
      });
      const data = await res.json();
      Toast("success", data.message);
      setRefresh(!refresh);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className=" relative flex  justify-center  items-center">
        <Button onClick={() => setOpenDeleteBox(true)}>
          <Trash className="text-red-600 h-4"/>
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
                  onClick={() => {
                    handleDelete(id);
                    setOpenDeleteBox(false);
                  }}
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
};

export default DeleteTest;
