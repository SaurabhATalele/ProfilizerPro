"use client";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import Verify from "./Verify";
import SendEmail from "./SendEmail";
import Reset from "./Reset";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";
import Navbar from "../Navbar/Navbar";

const Otp = () => {
  const [otp, setOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [Verified, setVerified] = useState(false);
  const handleOtp = (userOtp) => {
    if (userOtp === otp) {
      Toast("success", "OTP Verified");
      setVerified(!Verified);
    } else {
      Toast("error", "Incorrect OTP");
    }
  };
  const handleSendMail = async (e, email) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/users/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.message === "User Not Found") {
        Toast("error", "User Not Found");
        return;
      }

      setOtp(data.otp);
      setEmail(email);
      Toast("success", "OTP Sent to your Email");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <ToastContainer />
      <div className={"absolute w-screen mt-5 flex justify-center"}>
        <Navbar />
      </div>
      <div className="w-screen h-screen flex justify-center items-center gap-20">
        {!otp ? (
          <SendEmail handleSendMail={handleSendMail} />
        ) : (
          !Verified && <Verify handleOtp={handleOtp} />
        )}
        {Verified && <Reset email={email} />}

        <Image
          src={"/ResetImage/email.gif"}
          alt="my gif"
          width={450}
          height={400}
        />
      </div>
    </>
  );
};

export default Otp;
