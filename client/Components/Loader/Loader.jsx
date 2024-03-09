"use client";

import { TailSpin } from "react-loader-spinner";

function Loader() {
  return (
    <>
      <div className=" flex justify-center text-center  h-screen w-screen  ">
        <TailSpin color="blue" radius={"8px"} width={200} height={700} />
        <h1 className="text-2xl font-semibold">
          Please Wait while Your test is being loaded...
        </h1>
      </div>
    </>
  );
}
export default Loader;
