"use client";
import React, { useState } from "react";
import { Button, Modal } from "flowbite-react";
import QuestionCard from "./QuestionCard";

const QuestionModal = ({ data }) => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <div className="relative flex  justify-center">
      <Button
        onClick={() => setOpenModal(true)}
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
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
