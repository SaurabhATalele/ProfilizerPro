import  { FC } from "react";

interface ButtonProps {
  num: number;
  status: "unattempted" | "attempted" | "marked";
  current?: number;
  setCurrent: (value: number) => void;
}

const Button: FC<ButtonProps> = ({ num, status, current, setCurrent }) => {
  return (
    <>
      <button
        onClick={() => setCurrent(num - 1)}
        className={` w-10 h-8 rounded-md ${status === "unattempted" && "bg-slate-100"} ${status === "attempted" && "bg-green-500 text-white"} ${status === "marked" && "bg-yellow-500"} ${current === num && "bg-blue-500"}`}
      >
        {num}
      </button>
    </>
  );
};

export default Button;
