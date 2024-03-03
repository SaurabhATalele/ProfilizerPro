"use client";
import React, { useEffect, useState } from "react";
import Button from "@/Components/examDash/Button";
import axios from "axios";

function ExamDash() {
  const [ques, setQues] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const res = await axios.post("http://localhost:3000/chat/", {
          prompt:
            "I have given you a json which will contain the  name of the topic and number of questions required on that topic (they are specified in the json) In python. give me a array of json of questions, options and answers on the topics. the json is :  {  'questions': { 'Data types': 3, 'basics': 4  }}. I want tehe answer only in {\n    'Data types': [\n        {\n            'question': 'What is the data type of 5?',\n            'options': ['Integer', 'String', 'Boolean', 'Float'],\n            'answer': 'Integer'\n        },\n        {\n            'question': 'Which data type is used to represent True or False?',\n            'options': ['String', 'Boolean', 'Integer', 'Float'],\n            'answer': 'Boolean'\n        },\n        # Add more questions for 'Data types' topic if needed\n    ],\n    'basics': [\n        {\n            'question': 'What is the result of 2 + 3?',\n            'options': ['4', '6', '5', '7'],\n            'answer': '5'\n        },\n        {\n            'question': 'Which data type is used to store text?',\n            'options': ['String', 'Integer', 'Boolean', 'Array'],\n            'answer': 'String'\n        } this format. I want nothong apart form the json object",
        });
        console.log(res.data);
        const valuesArray = Object.values(res.data.response).flatMap(
          (category) => category.map((question) => question),
        );

        for (let i = 0; i < valuesArray.length; i++) {
          valuesArray[i].number = i + 1;
        }

        console.log(valuesArray);
        setQues(valuesArray);
      } catch (error) {
        console.log(error);
      }
    };
    getQuestions();
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
                  status="marked"
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
              {ques[currentQuestion]?.options &&
                ques[currentQuestion]?.options.map((item) => {
                  return (
                    <div class="flex items-center me-4  ">
                      <input
                        checked
                        id="purple-radio"
                        type="radio"
                        value=""
                        name="colored-radio"
                        className=" w-11 h-5"
                      />
                      <label
                        for="purple-radio"
                        class="ms-2 text-xl font-normal text-gray-900 dark:text-gray-300"
                      >
                        {item}
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className=" flex gap-9 justify-center items-center p-10">
            <button className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center">
              Prev
            </button>
            <button className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center">
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExamDash;
