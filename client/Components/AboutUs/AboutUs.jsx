// Import necessary libraries and components
import React from "react";
import Image from "next/image";
import Link from "next/link";

const AboutUs = () => {
  return (
    <>
      <div className="w-3/4 min-h-screen flex flex-col md:flex-row justify-center items-center gap-20 py-12 mx-auto">
        <div className="w-full md:w-1/2 lg:w-3/5 xl:w-2/5">
          <Image
            src="/SignupImages/aboutus.png"
            width={500}
            height={600}
            alt="About Us"
            className="rounded-md"
          />
        </div>
        <div className="flex flex-col items-center md:items-start p-5 w-full md:w-1/2 lg:w-2/5 shadow-md rounded-md dark:shadow-none dark:backdrop-blur-md dark:bg-[#33333342] shadow-gray-400">
          <h2 className="font-bold text-[1.5rem] mb-4">About Us</h2>
          <p className="text-center md:text-left mb-6">
            <h2 className="font-bold text-primary-light">
              Unlock Your Potential with ProfilizerPro
            </h2>
            <h3 className="font-bold">Empowering Growth:</h3> Dive deep into
            personal and professional development with our cutting-edge
            assessment tools. Discover your strengths, aptitudes, and areas for
            improvement with ProfilizerPro.
            <h3 className="font-bold">Tailored Insights:</h3> Our platform
            provides personalized assessments and actionable insights, helping
            individuals and organizations achieve their goals.
            <h3 className="font-bold">Innovative & Reliable:</h3> Backed by
            expert psychologists and tech innovators, we offer scalable
            solutions for everyone from individuals to large enterprises.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="p-2 bg-primary-light text-white rounded-md text-sm"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
