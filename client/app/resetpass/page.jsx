"use client"
import Navbar2 from "@/Components/Navbar/Navbar2";
import ResetPass from "@/Components/resetpass/ResetPass";
import React from "react";
import { useState, useEffect } from "react";

const page = () => {
  const [otp, setOtp] = useState("");
  
  return (
    <>
      <Navbar2 />
      <ResetPass />
    </>
  );
};

export default page;
