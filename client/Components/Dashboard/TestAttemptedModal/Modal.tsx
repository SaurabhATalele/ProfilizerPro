"use client";
import  { FC, useState } from "react";
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
        className="font-medium bg-transparent text-[var(--color-primary)] dark:text-[var(--color-primary)] hover:underline"
      >
        View
      </Button>
      <Modal
        show={openModal}
        dismissible
        onClose={() => setOpenModal(false)}
        className="self-center rounded-lg p-6 sm:p-8 z-50 h-full overflow-auto [&>div>div]:shadow-2xl  [&>div>div]:shadow-[var(--color-primary)]/10 dark:[&>div>div]shadow-white"
      >
        <Modal.Header className="border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0C0C0C]">
          <div className="font-bold text-[var(--color-dark-bg)] dark:text-white">
            Your performance in this Test
          </div>
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-[#0C0C0C]">
          <div className="flex flex-col gap-4 overflow-auto h-[70vh]">
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
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default QuestionModal;
