import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import React from "react";
import TestProvide from "./TestProvide";
import clsx from "clsx";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const Landing = () => {
  return (
    <div className="max-w-screen  flex flex-col items-center justify-center pt-24 gap-8">
      {/* Landing graphics and data  */}
      <div className=" w-3/4  flex items-center justify-between">
        <div className="flex flex-col w-1/2 gap-3">
          <h1 className="text-[4rem] font-bold leading-[3.5rem]">
            Take Online{" "}
            <span className="grad dark:text-primary-dark">Assessments</span>
          </h1>
          <p
            className={clsx(
              "text-[1.2rem] text-gray-500 dark:text-white",
              spaceGrotesk.className,
            )}
          >
            Get ready for your placements with us
          </p>

          <h2
            className={clsx(
              "flex gap-1 items-center mt-5 ",
              spaceGrotesk.className,
            )}
          >
            Number of active users
            <span className="font-bold text-[1.5rem] text-primary-light dark:text-primary-dark">
              200+
            </span>
          </h2>
        </div>
        <div className="flex items-center justify-center w-1/4">
          <Image
            src={"/homeImageBoy.svg"}
            width={400}
            height={400}
            alt="Boy Studying"
          />
        </div>
      </div>

      {/* benifits  */}
      <div className="w-3/4 ">
        <h2 className="text-center font-bold text-[1.3rem]">
          Benifits of choosing us
        </h2>
        <div className="flex w-full justify-between">
          <div className="flex flex-col items-center">
            <Image
              src={"/LandingImage/Bot.png"}
              width={129}
              height={129}
              alt="bot"
              className="w-20"
            />
            <p>AI Generated Tests</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={"/LandingImage/Popular.png"}
              width={129}
              height={129}
              className="w-20"
              alt="bot"
            />
            <p>Personalized Feedback</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={"/LandingImage/Track Order.png"}
              width={129}
              height={129}
              className="w-20"
              alt="bot"
            />
            <p>RoadMap Suggestions</p>
          </div>
        </div>
      </div>

      {/* Assessments provided  */}
      <div className="relative overflow-hidden min-w-[99vw] max-w-[100vw] h-96 bg-background-dark text-white shadow-md  flex flex-col items-center px-10 py-5 gap-14 z-0">
        <Image
          src={
            "https://cdn.prod.website-files.com/65159e844f8f08a72cefa2aa/65159e844f8f08a72cefa430_Requirement%20Bg.svg"
          }
          fill
          alt="bg"
          className="absolute z-10 scale-[3]"
        ></Image>
        <h1
          className={clsx("text-[2rem] font-bold z-20", spaceGrotesk.className)}
        >
          Assessments We provide
        </h1>
        <div className="w-3/4 flex justify-around items-center">
          <div className="relative flex flex-col items-center gap-4 z-20">
            <h1 className="absolute  text-[15rem] -left-3 -top-28 z-0 text-transparent font-bold font-outline-2 stroke-slate-100">
              1
            </h1>
            <Image
              src={"/LandingImage/GenAss.svg"}
              width={120}
              height={120}
              alt="General"
              className="w-44 h-44 z-20"
            />
            <p className={spaceGrotesk.className}>General Assessments</p>
          </div>
          <div className="relative flex flex-col items-center gap-4 z-20">
            <h1 className="absolute  text-[15rem] -left-3 -top-28 z-0 text-transparent font-bold font-outline-2 stroke-slate-100">
              2
            </h1>
            <Image
              src={"/LandingImage/tech.svg"}
              width={120}
              height={120}
              alt="Technical"
              className="w-44 h-44 z-20"
            />
            <p className={spaceGrotesk.className}>Technical Assessments</p>
          </div>

          <div className="relative flex flex-col items-center gap-4 z-20">
            <h1 className="absolute  text-[15rem] -left-3 -top-28 z-0 text-transparent font-bold font-outline-2 stroke-slate-100">
              3
            </h1>
            <Image
              src={"/LandingImage/Logical.svg"}
              width={120}
              height={120}
              alt="General"
              className="w-44 h-44 z-20"
            />
            <p className={spaceGrotesk.className}>Logical Assessments</p>
          </div>
        </div>
      </div>

      {/* tests provided  */}
      <TestProvide />

      {/* footer  */}
      {/* <footer className="w-3/4 flex justify-between p-5 border-t-2 dark:border-gray-50 dark:border-t-[1px]">
        <div className="flex gap-5">
          <Image
            src={"/LandingImage/footer.png"}
            width={230}
            height={230}
            alt="footer image"
          />
          <div className="flex flex-col gap-2">
            <h2 className="font-bold mb-5">Company</h2>
            <Link
              href={"/"}
              className="text-gray-600 text-sm  dark:text-gray-300"
            >
              About us
            </Link>
            <Link
              href={"/"}
              className="text-gray-600 text-sm dark:text-gray-300"
            >
              Tests
            </Link>
            <Link
              href={"/"}
              className="text-gray-600 text-sm dark:text-gray-300"
            >
              Tests
            </Link>
            <Link
              href={"/"}
              className="text-gray-600 text-sm dark:text-gray-300"
            >
              Tests
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Link
            href={"/register"}
            className="bg-primary-light text-white px-3 py-1  rounded-md"
          >
            Register
          </Link>
          <Link
            href={"/login"}
            className="border px-2 py-1 flex justify-center border-primary-light  rounded-md dark:text-primary-dark dark:border-primary-dark   text-primary-light"
          >
            Login
          </Link>

          <Link
            href={"/login"}
            className="border px-2 py-1 flex justify-center border-primary-light  rounded-md dark:text-primary-dark dark:border-primary-dark   text-primary-light"
          >
            Admin
          </Link>
        </div>
      </footer> */}

      {/* <FooterComponent /> */}
      <p className="text-sm text-left ">
        &#169; ProfilizerPro all rights reserved
      </p>
    </div>
  );
};

export default Landing;
