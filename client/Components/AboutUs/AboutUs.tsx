"use client";
import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rocket, Brain } from "lucide-react";

const AboutUs: FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col lg:flex-row justify-between items-center gap-16 px-6 lg:px-16 py-12 max-w-7xl mx-auto">
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
        <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
          <Image
            src="/SignupImages/aboutus.svg"
            width={600}
            height={600}
            alt="About Us"
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-start w-full lg:w-1/2 space-y-8 text-center lg:text-left">
        <div className="space-y-3">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase">About Us</h2>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Unlock Your Potential with <span className="text-[var(--color-primary)]">ProfilizerPro</span>
          </h1>
        </div>

        <div className="space-y-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          <p>
            Welcome to ProfilizerPro, the next-generation platform for online assessments. We bridge the gap between learning and achievement through intelligent, AI-driven test generation and deep analytics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-left">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 flex items-center gap-2">
                <Rocket className="w-6 h-6 text-[var(--color-primary)]" /> Empowering Growth
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Discover your strengths and aptitudes with curated, dynamic testing environments designed for modern challenges.</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 flex items-center gap-2">
                <Brain className="w-6 h-6 text-[var(--color-primary)]" /> Tailored Insights
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive actionable, personalized feedback powered by advanced AI to help accelerate your learning journey.</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold bg-[var(--color-primary)] hover:bg-opacity-90 text-white rounded-lg shadow-lg shadow-[var(--color-primary)]/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            Explore Assessments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
