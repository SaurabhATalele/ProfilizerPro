import React from "react";

function Button({ num, status, setCurrent }) {
  return (
    <>
      <button
        onClick={() => setCurrent(num - 1)}
        className={` w-10 h-8 rounded-md ${status === "attempted" && "bg-green-500"} ${status === "marked" && "bg-yellow-500"} bg-stone-100`}
      >
        {num}
      </button>
    </>
  );
}

export default Button;
