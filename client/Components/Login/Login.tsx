"use client";
import { FC, useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";
import { login } from "@/Utils/Apicalls/Login";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getCookie } from "cookies-next";
import { useUser } from "@/Utils/UserContext";

const Login: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const { refreshUser } = useUser();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    console.log(email,password)
    try {
      const res = await login({ email, password });
      console.log(res)

      if (res.status === 200) {
        const data = await res.json();
        console.log(data);
        localStorage.setItem("token", data.token);
        await refreshUser();
        Toast("success", "Login Success...");
        router.push("/");
      } else if (res.status === 404) {
        Toast("error", "User Not Found");
      } else if (res.status === 403) {
        Toast("error", "Incorrect Password");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      Toast("error", message);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col-reverse md:flex-row justify-center items-center gap-10 md:gap-20 px-5 pb-10">
        <div className="relative p-8 w-full max-w-md bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl flex flex-col gap-6 transform transition-all hover:scale-[1.01]">
          <div className="text-center space-y-2">
            <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white">Let&apos;s Sign You In</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Welcome back, <br /> you have been missed!
            </p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="email"
                placeholder="Enter Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 text-sm dark:text-white"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="passwd"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 text-sm dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link
                href="/password-recovery"
                className="text-primary hover:text-[var(--color-primary)] text-xs font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-opacity-90 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 transform hover:-translate-y-0.5 mt-2"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--color-primary)] dark:text-white hover:underline font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>
        <div className="hidden md:flex justify-center items-center w-full max-w-[400px]">
          <Image
            src="/LoginImages/LoginImage.svg"
            width={400}
            height={400}
            alt="Secure sign in"
            className="object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </>
  );
};

export default Login;
