"use client";
import  { FC, useState } from "react";
import { Button, Modal } from "flowbite-react";

interface Topic {
  name: string;
}

interface EditTestData {
  name?: string;
  description?: string;
  icon?: string;
  topics?: Topic[];
}

interface EditTestProps {
  data: EditTestData;
  refesh?: boolean;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const EditTest: FC<EditTestProps> = ({ data, openModal, setOpenModal }) => {
  const [topics, setTopics] = useState<Topic[]>(data.topics || []);
  const [testName, setTestName] = useState<string>(data.name || "");
  const [description, setDescription] = useState<string>(data.description || "");
  const [icon, setIcon] = useState<string>(data.icon || "");
  const [topic, setTopic] = useState<string>("");

  const handleEditTest = async (): Promise<void> => {
    const payload = {
      name: testName,
      description,
      icon,
      topics,
    };
    try {
      const res = await fetch("/api/v1/assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      await res.json();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative flex w-full justify-center">
      <Modal
        show={openModal}
        dismissible
        onClose={() => setOpenModal(false)}
        className="self-center  dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 z-50"
      >
        <Modal.Header>
          <div className="text-primary-light">Add a New Test</div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6 ">
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="text-primary-light">
                Test Name
              </label>
              <input
                type="text"
                id="name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="px-2 py-1 rounded-md border dark:bg-gray-800"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="description" className="text-primary-light">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-2 py-1 rounded-md border dark:bg-gray-800"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="icon" className="text-primary-light">
                Icon
              </label>
              <input
                type="text"
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="px-2 py-1 rounded-md border dark:bg-gray-800"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="topics" className="text-primary-light">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                className="px-2 py-1 rounded-md border dark:bg-gray-800"
                onChange={(e) => {
                  setTopic(e.target.value);
                }}
              />
              <button
                className={`p-1 bg-primary-light text-white w-fit rounded-md disabled:bg-slate-400`}
                onClick={() => {
                  setTopics([...topics, { name: topic }]);
                  setTopic("");
                }}
                disabled={!topic}
              >
                Add
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="topics" className="text-primary-light">
                Topics
              </label>
              <ul className="flex flex-wrap gap-2">
                {topics &&
                  topics.map((topicItem, index) => (
                    <li
                      key={index}
                      className="flex gap-2 bg-violet-200  p-2 text-sm rounded-md"
                    >
                      {topicItem.name}
                      <button
                        className="text-gray-500"
                        onClick={() => {
                          const newTopics = topics.filter(
                            (_, i) => i !== index,
                          );
                          setTopics(newTopics);
                        }}
                      >
                        X
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              handleEditTest();
              setOpenModal(false);
            }}
            className="bg-primary-light dark:bg-primary-dark px-2 py-1 text-white rounded-md mr-2"
          >
            Create Test
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditTest;
