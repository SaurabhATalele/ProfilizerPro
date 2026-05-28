"use client";

import { TailSpin } from "react-loader-spinner";
import "./Loader.css";

function Loader() {
  return (
    <>
      <div className=" w-screen flex flex-col justify-center items-center text-center  h-screen">
        <h1 className=" absolute bottom-3 2xl:top-10 text-2xl font-semibold">
          Please Wait while Your test is being loaded...
        </h1>
        <div class="container w-16 h-14">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>
      </div>
    </>
  );
}
export default Loader;
