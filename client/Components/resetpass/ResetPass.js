import React from "react";
import Image from "next/image";
const ResetPass = () => {
  return (

<>
<div className="w-screen h-screen flex justify-center items-center gap-20">
    <div className="relative p-3 w-80 h-96 shadow-md rounded-md dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col   ">
      <h2 className="font-bold text-[1.5rem] py-4 text-center">Reset Password</h2>
      <p className="text-center p-0 text-sm font-medium">
        Enter your email for a password reset link.
      </p>
    <form>
      <input
        type="email"
        placeholder="Enter Email or Username"
        className="p-2 bg-transparent border rounded-md text-sm w-full mt-10"
      />
      <p className="text-start m-0 text-blue-500 p-2 italic text-sm">Forget Email ?</p>
      <button className="w-72 h-8 rounded-md mt-12 bg-primary-light text-white">Send Reset Link</button>
      <p className="text-center text-blue-500 text-sm p-3">Back to Sign in</p>
      </form>
    </div>
    <Image
      src={"/ResetImage/Gmail.png"}
      width={350}
      height={490}
      alt="Login"
      
    />
    </div>
    
</>


  );
};

export default ResetPass;
