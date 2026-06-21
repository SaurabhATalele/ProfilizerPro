"use client";
import { FC, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { register } from "@/Utils/Apicalls/User";
import { ToastContainer } from "react-toastify";
import Toast from "@/Utils/Toast";

interface UserForm {
  username: string;
  name:string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: FC = () => {
  const [user, setUser] = useState<UserForm>({
    username: "",
    name:"",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!user.username.trim()) {
      Toast("error", "Username is required");
      return;
    }
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
    <>
      <ToastContainer />
      <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20 px-5 pb-10">
        <div className="hidden md:flex justify-center items-center w-full max-w-[400px]">
          <Image
            src="/SignupImages/Signup.png"
            width={400}
            height={400}
            alt="Signup"
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="relative p-8 w-full max-w-md bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl flex flex-col gap-6 transform transition-all hover:scale-[1.01]">
          <div className="text-center space-y-2">
            <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white">Let&apos;s Sign You Up</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome to ProfilizePro</p>
          </div>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 text-sm dark:text-white"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter Username"
                name="UserName"
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 text-sm dark:text-white"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 text-sm dark:text-white"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
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
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 text-sm dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-opacity-90 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/30 transform hover:-translate-y-0.5 mt-2"
            >
              Signup
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] dark:text-white hover:underline font-semibold transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
