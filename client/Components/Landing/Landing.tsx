"use client";
import { FC } from "react";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import TestProvide from "./TestProvide";
import clsx from "clsx";
import { Brain, Lightbulb, MessageSquareMore } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

interface BenifitTileProps {
  Logo: React.ReactElement;
  testType: string;
  description: string;
}

const BenifitTile: FC<BenifitTileProps> = ({ Logo, testType, description }) => {
  return (
    <div className="flex gap-4 border dark:border-gray-800 p-3 px-6 rounded-lg xl:w-1/3">
      <div className="flex flex-col gap-3">
        <p className="font-semibold flex gap-4 items-center">
          <div className="text-[var(--color-secondary)] font-light">
          {Logo}
          </ div>
          {testType}
        </p>
        <p className={clsx("text-sm text-justify", spaceGrotesk.className)}>
          {description}
        </p>
      </div>
    </div>
  );
};

const Landing: FC = () => {
  return (
    <div className="max-w-screen flex flex-col items-center justify-center pt-24 gap-8">
      <div className="w-[90%] lg:w-3/4 xl:w-1/2 flex items-center justify-center">
        <div className="flex flex-col w-full md:w-3/4 lg:w-1/2 gap-3 text-center lg:text-left items-center lg:items-start">
          <h1 className="text-[2.5rem] lg:text-[4rem] font-bold leading-[3rem] lg:leading-[3.5rem]">
            Take Online{" "}
            <span className="text-[var(--color-secondary)]">Assessments</span>
          </h1>
          <p className={clsx("text-[1.2rem] text-gray-500 dark:text-white", spaceGrotesk.className)}>
            Get ready for your placements with us
          </p>
          <h2 className={clsx("flex gap-1 items-center mt-5", spaceGrotesk.className)}>
            Number of active users
            <span className="font-bold text-[1.5rem] text-primary dark:text-secondary">200+</span>
          </h2>
        </div>
        <div className="flex items-center justify-center w-1/4 hidden lg:block">
          <Image src="/homeImageBoy.svg" width={400} height={400} alt="Boy Studying" />
        </div>
      </div>

      <div className="w-[90%] lg:w-3/4 xl:w-1/2 flex flex-col gap-5">
        <h2 className="text-center font-bold text-[1.3rem]">Benifits of choosing us</h2>
        <div className="flex flex-col xl:flex-row w-full gap-3 justify-between">
          <BenifitTile
            Logo=<Brain/>
            testType="AI Generated Tests"
            description="Create customized tests using advanced AI algorithms to meet your specific needs and learning goals."
          />
          <BenifitTile
            Logo= <MessageSquareMore/>
            testType="Personalized Feedback"
            description="Receive tailored feedback that helps you understand your strengths and areas for improvement, accelerating your learning process."
          />
          <BenifitTile
            Logo= <Lightbulb/>
            testType="Roadmap Suggestions"
            description="Get guided suggestions for your learning journey, helping you stay on track and achieve your goals efficiently."
          />
        </div>
      </div>

      <div className="relative overflow-hidden w-full min-h-[24rem] py-10 lg:h-96 bg-background-dark text-white shadow-md flex flex-col items-center px-5 lg:px-10 gap-14 z-0">
        <Image
          src="https://cdn.prod.website-files.com/65159e844f8f08a72cefa2aa/65159e844f8f08a72cefa430_Requirement%20Bg.svg"
          fill
          alt="bg"
          className="absolute z-10 scale-[3]"
        />
        <h1 className={clsx("text-[2rem] font-bold z-20", spaceGrotesk.className)}>
          Assessments We provide
        </h1>

        <div className="w-full md:w-[90%] lg:w-3/4 xl:w-1/2 flex flex-col lg:flex-row justify-around items-center gap-16 lg:gap-0 pb-10 lg:pb-0">
          <div className="relative flex flex-col items-center gap-4 z-20">
            <h1 className="absolute text-[15rem] -left-3 -top-28 z-0 text-transparent font-bold font-outline-2 stroke-slate-100">1</h1>
            <Image src="/LandingImage/GenAss.svg" width={120} height={120} alt="General" className="w-44 h-44 z-20" />
            <p className={spaceGrotesk.className}>General Assessments</p>
          </div>
          <div className="relative flex flex-col items-center gap-4 z-20">
            <h1 className="absolute text-[15rem] -left-3 -top-28 z-0 text-transparent font-bold font-outline-2 stroke-slate-100">2</h1>
            <Image src="/LandingImage/tech.svg" width={120} height={120} alt="Technical" className="w-44 h-44 z-20" />
            <p className={spaceGrotesk.className}>Technical Assessments</p>
          </div>
          <div className="relative flex flex-col items-center gap-4 z-20">
            <h1 className="absolute text-[15rem] -left-3 -top-28 z-0 text-transparent font-bold font-outline-2 stroke-slate-100">3</h1>
            <Image src="/LandingImage/Logical.svg" width={120} height={120} alt="Logical" className="w-44 h-44 z-20" />
            <p className={spaceGrotesk.className}>Logical Assessments</p>
          </div>
        </div>
      </div>

      <TestProvide />
    </div>
  );
};

export default Landing;
