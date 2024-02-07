"use client";
import React from "react";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { BASE_URL } from "@/Utils/constants";

import Toast from "@/Utils/Toast";
import Image from "next/image";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/users/login`, {
        email,
        password,
      });

      console.log(res);
      Toast("success", "Login Success...");
    } catch (error) {
      console.log(error);
      Toast("error", error.response.data.message);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-3/4 h-screen flex justify-center items-center gap-20">
        <div className="relative p-5 w-80 h-96 shadow-md rounded-md dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col items-center justify-around   ">
          <h2 className="font-bold text-[1.5rem]">Lets Sign you in</h2>
          <p className="text-center">
            Welcome Back,
            <br />
            You have been missed
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 bg-transparent border rounded-md text-sm w-full my-2"
            />
            <input
              type="password"
              name="password"
              id="passwd"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
            />
            <input
              type="submit"
              value="Login"
              className="p-2 bg-primary-light text-white rounded-md text-sm w-full my-2 "
            />
          </form>

          <p>
            Don't have an account?{" "}
            <Link href={"/register"} className="text-primary-light">
              Register
            </Link>
          </p>
        </div>
        <Image
          src={"/LoginImages/LoginImage.png"}
          width={300}
          height={450}
          alt="Login"
        />
      </div>
    </>
  );
};

export default Login;
