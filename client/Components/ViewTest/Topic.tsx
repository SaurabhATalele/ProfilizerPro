"use client";
import React, { FC, useState, ChangeEvent } from "react";

interface TopicProps {
  name: string;
  minQuestions: number;
  maxQuestions: number;
  setSelectedTopics: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const Topic: FC<TopicProps> = ({ name, minQuestions, maxQuestions, setSelectedTopics }) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string>("0");

  const handleSelected = (e: ChangeEvent<HTMLInputElement>): void => {
    setIsSelected(e.target.checked);
    if (!e.target.checked) {
      setSelectedTopics((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    } else {
      setSelectedTopics((prev) => {
        return { ...prev, [name]: questions };
      });
    }
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setQuestions(e.target.id);
    setSelectedTopics((prev) => {
      return { ...prev, [name]: e.target.id };
    });
  };

  return (
    <li className="flex flex-col gap-1 w-full">
      <div className="flex gap-3 items-center">
        <input
          type="checkbox"
          name={name}
          id="tech 1"
          className="h-4 w-4 "
          onChange={handleSelected}
        />
        <label htmlFor="tech1" className="text-md font-semibold">
          {name}
        </label>
      </div>
      {isSelected && (
        <div className="flex gap-4 items-center radio-grp">
          {Array.from(
            { length: maxQuestions - minQuestions + 1 },
            (_, i) => i + (maxQuestions - minQuestions) + 1,
          ).map((i, index) => (
            <div key={index} className="flex items-center gap-1">
              <input
                type="radio"
                name={name}
                id={String(i)}
                className="h-4 w-4"
                onChange={handleNumberChange}
              />
              <label htmlFor={`tech1-${index}`} className="text-sm">
                {i}
              </label>
            </div>
          ))}
        </div>
      )}
    </li>
  );
};

export default Topic;
