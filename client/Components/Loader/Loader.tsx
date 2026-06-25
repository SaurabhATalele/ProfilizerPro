"use client";
import { FC } from "react";
import "./Loader.css";

const Loader: FC = () => {
  return (
    <div className="w-screen flex flex-col justify-center items-center text-center h-[90vh]">
      <div className="container w-16 h-14">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="circle"></div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
