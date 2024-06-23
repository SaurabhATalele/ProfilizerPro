// Import necessary libraries and components
import React from "react";
import Image from "next/image";
import Link from "next/link";

const AboutUs = () => {
  return (
    <div className="w-3/4 min-h-screen flex flex-col md:flex-row justify-center items-center gap-20 py-12 xl:py-24 mx-auto">
      <div className="w-full md:w-1/2 lg:w-3/5 xl:w-2/5">
        <Image
          src="/SignupImages/aboutus.png"
          width={900}
          height={800}
          alt="About Us"
          className="rounded-md w-4/5"
        />
      </div>
      <div className="flex flex-col items-center md:items-start p-5 w-full md:w-1/2 lg:w-2/5">
        <h2 className="font-bold text-[1.6rem] mb-4">About Us</h2>
        <p className="text-center md:text-left mb-6 flex flex-col gap-4 text-gray-500">
          <span className="font-bold text-primary-light text-[1.2rem]">
            Unlock Your Potential with ProfilizerPro
          </span>
          <span className="font-bold text-[1.2rem] text-gray-800">
            Empowering Growth:
          </span>{" "}
          Dive deep into personal and professional development with our
          cutting-edge assessment tools. Discover your strengths, aptitudes, and
          areas for improvement with ProfilizerPro.
          <span className="font-bold text-[1.2rem] text-gray-800">
            Tailored Insights:
          </span>{" "}
          Our platform provides personalized assessments and actionable
          insights, helping individuals and organizations achieve their goals.
          <span className="font-bold text-[1.2rem] text-gray-800">
            Innovative & Reliable:
          </span>{" "}
          Backed by expert psychologists and tech innovators, we offer scalable
          solutions for everyone from individuals to large enterprises.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="px-3 py-2 text-[1.3rem] bg-primary-light text-white rounded-md text-sm "
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
