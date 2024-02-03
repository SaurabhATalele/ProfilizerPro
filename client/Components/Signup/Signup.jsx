import React from "react";
import Link from "next/link";
const Login = () => {
  return (
    <div className="w-3/4 h-screen  grid place-content-center">
      <div className="relative p-5 w-80 h-96 shadow-md rounded-md dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400 flex flex-col items-center justify-around   ">
        <h2 className="font-bold text-[1.5rem]">Lets Sign you up</h2>
        <p className="text-center">
          Welcome to ProfilizePro
        </p>
        <form action="">
          <input
            type="text"
            placeholder="Enter Username"
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2"
          />
          <input
            type="password"
            name="password"
            id="passwd"
            placeholder="******"
            className="p-2 bg-transparent border rounded-md text-sm w-full my-2 "
          />
             <input
            type="password"
            name="password"
            id="passwd"
            placeholder="Confirm Password"
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

export default Login;
