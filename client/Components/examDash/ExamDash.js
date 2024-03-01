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
              return <Button num={ele} status="marked"  />;
            })}
          </div>
          <div className="p-10">
            <button className=" w-28 h-10 bg-green-400 rounded-md ">Submit</button>
          </div>
        </div>
        <div className="flex flex-col  mt-28  text-center justify-between w-2/3 ">
            <div className=" flex gap-8 ">
                <div className="w-1/2 ">
                    <h2 className=" text-xl text-slate-700 font-semibold">Question number: 1</h2>
                    <p className="  text-xl ">
                    The "function" and " var" are known as :
                    </p>

                </div>
                <div className=" flex  gap-5 flex-col w-1/2  ml-16 ">      
      <div class="flex items-center me-4  ">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio" className=" w-11 h-5"  />
        <label for="purple-radio" class="ms-2 text-xl font-normal text-gray-900 dark:text-gray-300">Keywords</label>
    </div>
    <div class="flex items-center me-4">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio" className=" w-11 h-5"   />
        <label for="purple-radio" class="ms-2 text-xl font-normal text-gray-900 dark:text-gray-300">Data types</label>
    </div>
    <div class="flex items-center me-4">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio"  className=" w-11 h-5"  />
        <label for="purple-radio" class="ms-2 text-xl font-normal text-gray-900 dark:text-gray-300">Declaration statements</label>
    </div>
    <div class="flex items-center me-4">
        <input checked id="purple-radio" type="radio" value="" name="colored-radio" className=" w-11 h-5"  />
        <label for="purple-radio" class="ms-2 text-xl font-normal text-gray-900 dark:text-gray-300">Prototypes</label>
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
