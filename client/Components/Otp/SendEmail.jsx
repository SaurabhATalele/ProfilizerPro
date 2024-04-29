import React, { useState } from "react";

const SendEmail = ({ handleSendMail }) => {
  const [email, setEmail] = useState("");
  return (
    <div className="relative p-3 w-80 h-96 shadow-md rounded-xl dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col text-center items-center justify-center gap-5">
      <h1 className="font-bold  mt-5 text-2xl">Reset Password</h1>
      <p className=" text-sm text-black font-medium ">
        Enter your email address below to receive an OTP to reset password.{" "}
      </p>

      <form onSubmit={(e)=>handleSendMail(e,email)}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
        />
        <button
          className="bg-primary-light text-white p-2 rounded-md text-sm"
          onClick={() => handleSendMail(email)}
        >
          Get OTP
        </button>
      </form>
    </div>
  );
};

export default SendEmail;
