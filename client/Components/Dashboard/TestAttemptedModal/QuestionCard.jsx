import React from "react";

const QuestionCard = ({ question, answer, yourAnswer }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="text-md font-medium">{question}</div>
        <div
          className={`text-md font-medium ${yourAnswer === answer ? "text-green-400" : "text-red-400"}`}
        >
          {yourAnswer === answer ? "Correct" : "Incorrect"}
        </div>
      </div>
      <div className="flex gap-2 flex-col">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-400">Your Answer</div>
          <div className="text-sm">{yourAnswer}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-400">
            Correct Answer
          </div>
          <div className="text-sm">{answer}</div>
        </div>
      </div>
      <hr className="py-4" />
    </div>
  );
};

export default QuestionCard;
