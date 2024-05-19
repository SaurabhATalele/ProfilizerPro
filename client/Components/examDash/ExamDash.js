"use client";
import React, { useEffect, useState, useContext, Suspense } from "react";
import Button from "@/Components/examDash/Button";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import Loader from "@/Components/Loader/Loader";
import TopicContext from "@/Utils/TestContext";

function ExamDash() {
  const [topic, setTopic] = useState("Python");
  const [questions, setQuestions] = useState({});
  const [ques, setQues] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const { topics, setTopics } = useContext(TopicContext);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const path = pathname.split("/");

  const testId = path[3];

  let count = 1;
  useEffect(() => {
    const getQuestions = async () => {
      try {
        setLoading(true);
        const subtopics = JSON.stringify(topics.subtopics);
        const prompt = `I have given you a json which will contain the  name of the topic and number of questions required on that topic (they are specified in the json) In ${topics.topic}. the json is :  {  'questions': ${subtopics}}. give me a array of json of questions, options and answers on the topics.  I want tehe answer only in {'topic':['question','options':[option1,option2,optionn],'answer']} this format. I want nothing apart form the json object. The number of questions should taken from the questions json. also do not include doublequotes in the output instead use singlequotes. also provide a json only in this output`;
        const res = await axios.post("http://localhost:3000/chat/", {
          prompt: { topic: topics.topic, questions: subtopics },
        });
        console.log(res.data);
        const valuesArray = Object.values(res.data.response).flatMap(
          (category) => category.map((question) => question),
        );

        for (let i = 0; i < valuesArray.length; i++) {
          valuesArray[i].number = i + 1;
          valuesArray[i].status = "unattempted";
        }

        console.log(valuesArray);
        setQues(valuesArray);
        console.log(ques);
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

    // write a cleanup function
    return () => {
      setQues([]);
      setAnswers({});
    };
  }, []);

  const submitTest = async () => {
    let questionsAndAnswers = [];
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
                        <div class="flex items-center justify-start me-4  ">
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
                                return prev;
                              });
                            }}
                          />
                          <label
                            for="purple-radio"
                            class="ms-2 text-xl text-left font-normal text-gray-900 dark:text-gray-300 w-80"
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
}

export default ExamDash;
