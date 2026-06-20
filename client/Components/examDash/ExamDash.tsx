"use client";
import React, { FC, useEffect, useState, useContext, Suspense, ChangeEvent } from "react";
import Button from "@/Components/examDash/Button";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import Loader from "@/Components/Loader/Loader";
import TopicContext from "@/Utils/TestContext";

interface Question {
  question: string;
  options: string[];
  answer: string;
  number: number;
  status: "unattempted" | "attempted" | "marked";
}

interface TopicContextType {
  topics: {
    topic: string;
    subtopics: Record<string, string>;
  };
  setTopics: (value: { topic: string; subtopics: Record<string, string> }) => void;
}

const ExamDash: FC = () => {
  const [topic, setTopic] = useState<string>("Python");
  const [questions, setQuestions] = useState<Record<string, unknown>>({});
  const [ques, setQues] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { topics, setTopics } = useContext(TopicContext) as TopicContextType;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();

  const path = pathname.split("/");
  const testId = path[3];

  let count = 1;

  useEffect(() => {
    const getQuestions = async (): Promise<void> => {
      try {
        setLoading(true);
        const subtopics = JSON.stringify(topics.subtopics);
        const res = await axios.post("http://localhost:3000/chat/", {
          prompt: { topic: topics.topic, questions: subtopics },
        });
        console.log(res.data);
        const valuesArray: Question[] = Object.values(
          res.data.response as Record<string, Array<{ question: string; options: string[]; answer: string }>>,
        ).flatMap((category) => category.map((question) => question)) as Question[];

        for (let i = 0; i < valuesArray.length; i++) {
          valuesArray[i].number = i + 1;
          valuesArray[i].status = "unattempted";
        }

        console.log(valuesArray);
        setQues(valuesArray);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (count === 1) {
      getQuestions();
      count++;
    }

    return () => {
      setQues([]);
      setAnswers({});
    };
  }, []);

  const submitTest = async (): Promise<void> => {
    const questionsAndAnswers: Array<{
      question: string;
      answer: string;
      yourAnswer: string;
    }> = [];
    for (let i = 0; i < ques.length; i++) {
      questionsAndAnswers.push({
        question: ques[i].question,
        answer: ques[i].answer,
        yourAnswer: answers[i],
      });
      if (answers[i] === ques[i].answer) {
        setScore((prev) => prev + 1);
      }
    }
    console.log(questionsAndAnswers, testId);
    const res = await axios.put("/api/v1/assignment", {
      questions: questionsAndAnswers,
      id: testId,
      total: ques.length,
      score,
      email: "saurabhatalele@gmail.com",
    });
    console.log(res.data);
    router.push("/success");
  };

  return (
    <>
      <Suspense fallback={<Loader />}>
        {loading ? (
          <Loader />
        ) : (
          <div className="flex w-screen h-screen  justify-evenly">
            <div className=" flex flex-col   text-center justify-between  w-1/3 p-5 border-r">
              <div className=" h-auto grid  grid-cols-6 gap-8 ">
                {ques.map((ele) => {
                  return (
                    <Button
                      key={ele.number}
                      num={ele.number}
                      setCurrent={setCurrentQuestion}
                      status={ques[ele.number - 1].status}
                    />
                  );
                })}
              </div>
              <div className="p-10">
                <button
                  onClick={submitTest}
                  className=" w-28 h-10 bg-green-400 rounded-md text-white "
                >
                  Submit
                </button>
              </div>
            </div>
            <div className="flex flex-col  border-r p-5  text-center justify-between w-2/3 ">
              <div className=" flex gap-8 h-full ">
                <div className="w-1/2 border-r h-full p-5 ">
                  <h2 className=" text-xl text-slate-700 font-semibold">
                    Question number: {currentQuestion + 1}
                  </h2>
                  <p className="  text-xl ">
                    {ques && ques[currentQuestion]?.question}
                  </p>
                </div>
                <div
                  className=" flex  gap-5 flex-col w-1/2  ml-16 "
                  radioGroup="options"
                >
                  {ques[currentQuestion]?.options &&
                    ques[currentQuestion]?.options.map((item) => {
                      return (
                        <div
                          className="flex items-center justify-start me-4"
                          key={item}
                        >
                          <input
                            id="purple-radio"
                            type="radio"
                            value={item}
                            name="colored-radio"
                            className=" w-11 h-5 text-left"
                            onChange={() => {
                              setAnswers((prev) => {
                                prev[currentQuestion] = item;
                                return prev;
                              });

                              if (item === ques[currentQuestion].answer) {
                                console.log("correct");
                                setScore((prev) => prev + 1);
                              } else {
                                console.log("incorrect");
                              }

                              setAnswers((prev) => {
                                prev[currentQuestion] = item;
                                return prev;
                              });

                              setQues((prev) => {
                                prev[currentQuestion].status = "attempted";
                                return [...prev];
                              });
                            }}
                          />
                          <label
                            htmlFor="purple-radio"
                            className="ms-2 text-xl text-left font-normal text-gray-900 dark:text-gray-300 w-80"
                          >
                            {item}
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className=" flex gap-9 justify-center items-center p-10">
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    setCurrentQuestion(
                      currentQuestion === ques.length - 1
                        ? 0
                        : currentQuestion + 1,
                    );
                  }}
                  className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </>
  );
};

export default ExamDash;
