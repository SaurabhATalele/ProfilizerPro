import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";

const Reset = ({ email }) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (password, confirmPassword) => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/v1/users/reset-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.message === "User Not Found") {
        Toast("error", "User Not Found");
        return;
      }
      Toast("success", "Password Reset Success");
      router.push("/login");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      {/* <ToastContainer /> */}
      <div className="relative p-3 w-80 h-96 shadow-md rounded-xl dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col text-center items-center justify-center gap-5">
        <h1 className="font-bold  mt-5 text-2xl">Reset Password</h1>
        <p className=" text-sm text-black font-medium ">
          Enter your new password.{" "}
        </p>

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
        />
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          placeholder="Confirm Password"
          className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
        />
        <button
          className="bg-primary-light text-white p-2 rounded-md text-sm"
          onClick={() => handleReset(password, confirmPassword)}
        >
          Reset Password
        </button>
      </div>
    </>
  );
};

export default Reset;
