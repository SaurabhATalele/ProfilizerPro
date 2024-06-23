import Image from "next/image";
import React from "react";
import TestProvide from "./TestProvide";

const Landing = () => {
  return (
    <div className="max-w-screen  flex flex-col items-center justify-center pt-24 gap-8">
      {/* Landing graphics and data  */}
      <div className=" w-3/4  flex items-center justify-between">
        <div className="flex flex-col w-1/2 gap-3">
          <h1 className="text-[4rem] font-bold leading-[3.5rem]">
            Take Online{" "}
            <span className="text-primary-light dark:text-primary-dark">
              Assessments
            </span>
          </h1>
          <p className="text-[1.2rem] text-gray-500 dark:text-white">
            Get ready for your placements with us
          </p>

          <h2 className="flex gap-1 items-center mt-5 ">
            Number of active users
            <span className="font-bold text-[2rem] text-primary-light dark:text-primary-dark">
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
      <div className="w-3/4 h-96 bg-primary-light text-white shadow-md rounded-md flex flex-col items-center px-10 py-5 gap-10">
        <h1 className="text-[1.5rem] font-bold">Assessments We provide</h1>
        <div className="w-full flex justify-around items-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={"/LandingImage/GenAss.svg"}
              width={120}
              height={120}
              alt="General"
              className="w-44 h-44"
            />
            <p>General Assessments</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Image
              src={"/LandingImage/tech.svg"}
              width={120}
              height={120}
              alt="Technical"
              className="w-44 h-44"
            />
            <p>Technical Assessments</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Image
              src={"/LandingImage/Logical.svg"}
              width={120}
              height={120}
              alt="General"
              className="w-44 h-44"
            />
            <p>Logical Assessments</p>
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
