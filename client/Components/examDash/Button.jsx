import React from "react";

function Button({ num, status, setActive }) {
  return (
    <>
      <button
        onClick={() => setActive(num - 1)}
        className={` w-10 h-8 rounded-md ${status === "unattempted" ? "bg-slate-200" : ""}  ${status === "attempted" ? "bg-green-500" : ""} ${status === "marked" ? "bg-yellow-500" : ""}`}
      >
        {num}
      </button>
    </>
  );
}

export default Button;
