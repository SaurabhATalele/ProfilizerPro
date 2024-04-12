"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/Utils/Apicalls/User";
import { ToastContainer, toast } from "react-toastify";
import Toast from "@/Utils/Toast";

const Signup = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (user.password.length < 8) {
      Toast("error", "Password should be atleast 8 characters long");
      return;
    }
    if (user.password !== user.confirmPassword) {
      Toast("error", "Passwords do not match");
      return;
    }
    const response = await register(user);
    if (response.status === 201) {
      Toast("success", "Signup Successfull");
      router.push("/login");
    } else {
      Toast("error", "User Already Exists");
    }
  };
  return (
    <div className="w-3/4 h-screen flex justify-center items-center gap-20">
      <ToastContainer />
      <Image
        src={"/SignupImages/Signup.png"}
        width={300}
        height={450}
        alt="Signup"
      />

      <div className="relative p-5 w-80 h-96 shadow-md rounded-md dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col items-center justify-around   ">
        <h2 className="font-bold text-[1.5rem]">Lets Sign you up</h2>
        <p className="text-center">Welcome to ProfilizePro</p>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Enter Name"
            name="text"
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2"
          />
          <input
            type="email"
            placeholder="Enter Email"
            name="email"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2"
          />
          <input
            type="password"
            name="password"
            id="passwd"
            placeholder="******"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
          />
          <input
            type="password"
            name="password"
            id="passwd"
            placeholder="Confirm Password"
            onChange={(e) =>
              setUser({ ...user, confirmPassword: e.target.value })
            }
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
          />
          <input
            type="submit"
            value="Signup"
            className="p-2 bg-primary-light text-white rounded-md text-sm w-full my-2 "
          />
        </form>

        <p>
          Already have an account?{" "}
          <Link href={"/login"} className="text-primary-light">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
