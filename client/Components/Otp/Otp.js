"use client"
import React from 'react'
import Image from 'next/image';
import OTPInput, { ResendOTP } from "otp-input-react";
import { useState } from "react";


const Otp = () => {
  const [OTP, setOTP] = useState("");
  return (
   <>
    <div className="w-screen h-screen flex justify-center items-center gap-20">
    <div className="relative p-3 w-80 h-96 shadow-md rounded-xl dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col text-center ">
        <h1 className="font-bold  mt-5 text-2xl">You've Got Email</h1>
        <p className="p-5 text-sm text-black font-medium ">We have sent the OTP verification code to your email address check your email and enter the code below. </p>
        <OTPInput        
      value={OTP}
      onChange={setOTP}
      autoFocus
      OTPLength={4}
      otpType="number"
        />
    </div>
    <Image src={"/ResetImage/email.gif"} alt="my gif"   width={450}
            height={400}  />
    </div>
   </>
  )
}

export default Otp