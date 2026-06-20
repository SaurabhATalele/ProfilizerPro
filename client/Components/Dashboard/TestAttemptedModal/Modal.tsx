"use client";
import React, { FC, useState } from "react";
import { Button, Modal } from "flowbite-react";
import QuestionCard from "./QuestionCard";

interface Question {
  _id: string;
  question: string;
  answer: string;
  yourAnswer: string;
}

interface ModalProps {
  data: {
    questions: Question[];
  };
}

const QuestionModal: FC<ModalProps> = ({ data }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <div className="relative flex  justify-center">
      <Button
        onClick={() => setOpenModal(true)}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        View
      </Button>
      <Modal
        show={openModal}
        dismissible
        onClose={() => setOpenModal(false)}
        className="self-center  dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 z-50  h-full overflow-auto"
      >
        <Modal.Header>
          <div className="text-primary-light">
            Your performance in this Test
          </div>
        </Modal.Header>
        <Modal.Body>
          {data.questions.map((question) => {
            return (
              <QuestionCard
                key={question._id}
                question={question.question}
                answer={question.answer}
                yourAnswer={question.yourAnswer}
              />
            );
          })}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default QuestionModal;
