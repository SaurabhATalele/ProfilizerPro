"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import animationData from "./animations/logoutAnimation.json";

const Lottie = dynamic(() => import("react-lottie"), {
  ssr: false,
});

const Page: FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    localStorage.removeItem("token");
    setMounted(true);
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl">
      {mounted && (
        <Lottie options={defaultOptions} height={320} width={320} />
      )}
      <h1 className="mt-6 text-center font-bold text-2xl text-gray-900 dark:text-white">
        Logging you out… please wait
      </h1>
    </div>
  );
};

export default Page;
