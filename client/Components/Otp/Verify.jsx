import React, { useState } from "react";
import OtpInput, { ResendOTP } from "react-otp-input";

const Verify = ({ handleOtp }) => {
  const [otp, setOtp] = useState("");

  return (
    <div className="relative p-3 w-80 h-96 shadow-md rounded-xl dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col text-center items-center justify-center gap-5">
      <h1 className="font-bold  mt-5 text-2xl">You've Got Email</h1>
      <p className=" text-sm text-black font-medium ">
        We have sent the OTP verification code to your email address check your
        email and enter the code below.{" "}
      </p>

      <OtpInput
        value={otp}
        onChange={setOtp}
        numInputs={4}
        renderSeparator={<span className="w-3"> </span>}
        renderInput={(props) => <input {...props} />}
        inputType="digit"
        inputStyle={"border w-10 text-center p-2 text-xl rounded-md"}
        skipDefaultStyles
      />
      <button
        className="bg-primary-light text-white p-2 rounded-md text-sm"
        onClick={() => handleOtp(otp)}
      >
        Verify
      </button>
    </div>
  );
};

export default Verify;
