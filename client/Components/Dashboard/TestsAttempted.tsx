"use client";
import  { FC } from "react";
import Modal from "./TestAttemptedModal/Modal";

interface Question {
  _id: string;
  question: string;
  answer: string;
  yourAnswer: string;
}

interface Attempt {
  date: string;
  score: number;
  correct: number;
  total: number;
  questions: Question[];
}

interface TestEntry {
  assignmentName: string;
  attempts: Attempt[];
}

interface TestsAttemptedProps {
  data: {
    data: TestEntry[];
  } | null;
}

const TestsAttempted: FC<TestsAttemptedProps> = ({ data }) => {
  return (
    <div className={" w-5/6 p-5 flex flex-col h-screen justify-between"}>
      {data?.data ? (
        <div className="relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-md">
          <table className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-300">
            <thead className="text-xs uppercase tracking-wider bg-gray-50 text-gray-500 dark:bg-[#141414] dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Test name
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Correct
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Total
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Score
                </th>
                <th scope="col" className="px-6 py-4">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data &&
                data.data.map((test) => {
                  return test.attempts.map((item, index) => {
                    return (
                      <tr
                        key={`${test.assignmentName}-${index}`}
                        className="bg-white border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:bg-[#0C0C0C] dark:border-gray-800 dark:hover:bg-[#141414] transition-colors"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {test.assignmentName}
                        </th>
                        <td className="px-6 py-4">{item.correct}</td>
                        <td className="px-6 py-4">{item.total}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[var(--color-primary)]">
                            {item.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Modal data={item} />
                        </td>
                      </tr>
                    );
                  });
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">
          No tests attempted yet!
        </div>
      )}
    </div>
  );
};

export default TestsAttempted;
