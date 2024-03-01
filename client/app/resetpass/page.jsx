<<<<<<< HEAD
import ExamDash from '@/Components/examDash/ExamDash'
import ResetPass from '@/Components/resetpass/ResetPass'
import React from 'react'
=======
"use client"
import Navbar2 from "@/Components/Navbar/Navbar2";
import ResetPass from "@/Components/resetpass/ResetPass";
import React from "react";
import { useState, useEffect } from "react";
>>>>>>> 42ac1c86effc70d3b8a579e4721fee35688e614e

const page = () => {
  const [otp, setOtp] = useState("");
  
  return (
<<<<<<< HEAD
  //  <ResetPass/>
  <ExamDash/>
  )
}
=======
    <>
      <Navbar2 />
      <ResetPass />
    </>
  );
};
>>>>>>> 42ac1c86effc70d3b8a579e4721fee35688e614e

export default page;
