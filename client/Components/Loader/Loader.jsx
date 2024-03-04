"use client";

import { TailSpin } from "react-loader-spinner";

function Loader() {
  return (
    <>
      <div className=" flex justify-center text-center  h-screen w-screen  ">
        <TailSpin color="blue" radius={"8px"} width={200} height={700} />
      </div>
    </>
  );
}
export default Loader;
