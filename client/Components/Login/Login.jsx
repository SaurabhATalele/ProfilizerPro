"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";
import { login } from "@/Utils/Apicalls/Login";
import Image from "next/image";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await login({
        email,
        password,
      });

      if (res.status === 200) {
        const data = await res.json();
        console.log(data);
        localStorage.setItem("token", data.token);
        Toast("success", "Login Success...");
        router.push("/");
      } else if (res.status === 404) {
        Toast("error", "User Not Found");
      } else if (res.status === 403) {
        Toast("error", "Incorrect Password");
      }
    } catch (error) {
      Toast("error", error.message);
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
            <Link href={"/password-recovery"} className="text-primary-light text-[12px]">
              Forgot Password?
            </Link>
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
