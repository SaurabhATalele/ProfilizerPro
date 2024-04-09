"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
import animationData from "./animations/logoutAnimation";

const page = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, []);
  return (
    <div className="w-screen flex flex-col justify-center">
      <div>
        <Lottie options={defaultOptions} height={400} width={400} />
      </div>
      <h1 className="text-center font-bold text-xl text-primary-light dark:text-primary-dark">
        Logging you out!!! please wait...
      </h1>
    </div>
  );
};

export default page;
