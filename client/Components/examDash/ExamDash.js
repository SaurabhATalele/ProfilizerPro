"use client";
import React from "react";
import Button from "@/Components/examDash/Button";
import {RadioGroup, Radio} from "@nextui-org/react";


function ExamDash() {
  const ques = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <>
      <div className="flex w-screen h-screen  justify-evenly">
        <div className=" flex flex-col  mt-28  text-center justify-between  w-1/3 p-5">
          <div className=" h-auto grid  grid-cols-6 gap-8 ">
            {ques.map((ele) => { 
              return <Button num={ele} status="marked" />;
            })}
          </div>
          <div className="p-10">
            <button className=" w-28 h-10 bg-green-400 rounded-md ">Submit</button>
          </div>
        </div>
        <div className="flex flex-col  mt-28  text-center justify-between w-2/3 border">
            <div className=" flex gap-8 border">
                <div className="w-1/2 ">
                    <h2>Question number 1</h2>
                    <p>
                        How many datatypes in python ?
                    </p>

                </div>
                <div className=" flex  gap-5 flex-col w-1/2">
      
      <div class="flex items-center me-4 ">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio"  />
        <label for="purple-radio" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Purple</label>
    </div>
    <div class="flex items-center me-4">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio"  />
        <label for="purple-radio" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Purple</label>
    </div>
    <div class="flex items-center me-4">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio"  />
        <label for="purple-radio" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Purple</label>
    </div>
    <div class="flex items-center me-4">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio"  />
        <label for="purple-radio" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Purple</label>
    </div>
      


                    

                </div>

            </div>
            <div className=" flex gap-9 justify-center items-center p-10">
                <button className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center">Prev</button>
                <button className="  bg-primary-light w-24 h-10 p-2 rounded-md text-white text-center">Next</button>

            </div>

        </div>
      </div>
    </>
  );
}

export default ExamDash;
