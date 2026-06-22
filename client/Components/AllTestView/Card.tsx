import  { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { DesignTestTile } from "../Admin/Tests/DesignTestTile";

interface Test {
  _id: string;
  name: string;
  icon: string;
  description: string;
}

interface CardProps {
  tests: Test[];
}

const Card: FC<CardProps> = ({ tests }) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
      {tests &&
        tests.map((test) => (
          <div
            key={test._id}
            className="relative flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2">
                <Image
                  src={test.icon}
                  width={60}
                  height={60}
                  alt={test.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                {test.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1 mt-2 leading-relaxed">
              {test.description}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Link href={`/test/${test._id}`} className="w-full block">
                <button className="w-full bg-[var(--color-primary)] hover:bg-opacity-90 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all shadow-md shadow-[var(--color-primary)]/20 hover:shadow-lg hover:shadow-[var(--color-primary)]/40 flex items-center justify-center">
                  Take Assessment
                </button>
              </Link>
            </div>
          </div>
        ))}
        <DesignTestTile/>
    </div>
  );
};

export default Card;
