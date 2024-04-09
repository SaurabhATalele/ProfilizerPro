"use client";
import React from "react";
import Lottie from "react-lottie";
import animationData from "./animations/animationSuccess";

const SuccessScreen = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col gap-5 items-center">
        <Lottie options={defaultOptions} height={400} width={400} />
        <h1 className="text-4xl font-bold text-green-600">
          Test Submitted Successfully
        </h1>
        <p className="text-xl">Thank You for taking the test</p>
        <form className="w-full max-w-lg ">
          <div className="flex flex-wrap -mx-3 mb-6"></div>
          <div className="flex flex-wrap -mx-3 mb-6 ">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-yellow-500 text-xs font-bold mb-2 text-center"
                htmlFor="reviewContent"
              >
                Enter Your Feedback
              </label>
              <textarea
                className="appearance-none block w-full  text-gray-700 border resize-none border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                id="reviewContent"
                placeholder="Enter review content"
              ></textarea>
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                Submit Review
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuccessScreen;
