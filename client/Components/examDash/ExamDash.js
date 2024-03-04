"use client";
import React, { useEffect, useState } from "react";
import Button from "@/Components/examDash/Button";
import axios from "axios";

function ExamDash() {
  const [topic, setTopic] = useState("Python");
  const [questions, setQuestions] = useState({});
  const [ques, setQues] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    // const { name, topics } = getQueryParams(window.location.search);
    // setTopic(name);
    // setQuestions(topics);
    // console.log(topics);
    // console.log(name);
  }, []);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const res = await axios.post("http://localhost:3000/chat/", {
          prompt:
            "I have given you a json which will contain the  name of the topic and number of questions required on that topic (they are specified in the json) In python. the json is :  {  'questions': { 'Data types': 7, 'basics': 8  }}. give me a array of json of questions, options and answers on the topics.  I want tehe answer only in {'topic':['question','options':[option1,option2,optionn],'answer']} this format. I want nothing apart form the json object. The number of questions should taken from the questions json. also do not include doublequotes in the output instead use singlequotes. also provide a json parsable object",
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
      }
    };
    getQuestions();

    // write a callback function to update the status of the question
  }, []);
  return (
    <>
      <div className="flex w-screen h-screen  justify-evenly">
        <div className=" flex flex-col  mt-28  text-center justify-between  w-1/3 p-5">
          <div className=" h-auto grid  grid-cols-6 gap-8 ">
            {ques.map((ele) => {
              return (
                <Button
                  num={ele.number}
                  setCurrent={setCurrentQuestion}
                  current={currentQuestion + 1}
                  status={ques[ele.number - 1].status}
                />
              );
            })}
          </div>
          <div className="p-10">
            <button className=" w-28 h-10 bg-green-400 rounded-md ">
              Submit
            </button>
          </div>
        </div>
        <div className="flex flex-col  mt-28  text-center justify-between w-2/3 ">
          <div className=" flex gap-8 ">
            <div className="w-1/2 ">
              <h2 className=" text-xl text-slate-700 font-semibold">
                Question number: {currentQuestion + 1}
              </h2>
              <p className="  text-xl ">
                {ques && ques[currentQuestion]?.question}
              </p>
            </div>
            <div className=" flex  gap-5 flex-col w-1/2  ml-16 ">
              {ques[currentQuestion] &&
                ques[currentQuestion]?.options.map((ele) => {
                  return (
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id={ele}
                        name={`${ques[currentQuestion].question}`}
                        className="h-5 w-5"
                        onChange={() => {
                          setQues((prev) => {
                            prev[currentQuestion].status = "attempted";
                            return prev;
                          });
                          console.log(ques);
                        }}
                      />
                      <label htmlFor={ele} className="text-xl">
                        {ele}
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className=" flex gap-9 justify-center items-center p-10">
            <button
              className={`bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center ${currentQuestion === 0 && "disabled"}`}
              onClick={() =>
                setCurrentQuestion(
                  currentQuestion !== 0 ? currentQuestion - 1 : 0,
                )
              }
            >
              Prev
            </button>
            <button
              className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center"
              onClick={() =>
                setCurrentQuestion(
                  currentQuestion !== ques.length - 1
                    ? currentQuestion + 1
                    : ques.length - 1,
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExamDash;
