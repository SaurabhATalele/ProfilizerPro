import Image from "next/image";
import Link from "next/link";

const TestProvide = async () => {
  const res = await fetch("http://localhost:4000/api/v1/assignment", {
    cache: "no-store",
  });
  const data = await res.json();
  const tests = data.data.slice(0, 3);
  return (
    <div className="w-3/4  bg-white dark:bg-black rounded-md flex flex-col items-center px-10 py-5 gap-10">
      <div className="w-full flex justify-between items-end">
        <h1 className="text-[1.5rem] font-bold">Tests We provide </h1>
        <Link
          href={"/all-tests"}
          className="font-light text-primary-light text-sm"
        >
          Explore More
        </Link>
      </div>
      {card(tests)}
    </div>
  );
};

const card = (tests) => {
  return (
    <div className="w-full grid grid-cols-3 gap-3 justify-around items-center">
      {tests &&
        tests.map((test) => (
          <div className="h-80 flex flex-col flex-grow-0 items-center gap-4 rounded-md shadow-md p-4 dark:shadow-gray-500 ">
            <Image
              src={test.icon}
              width={120}
              height={120}
              alt="General"
              className="w-24 h-24"
            />
            <p className="font-bold text-lg ">{test.name}</p>
            <p className="text-sm text-gray-500 line-clamp-3 text-justify w-full">
              {test.description}
            </p>
            <Link href={`/test/${test._id}`}>
              <button className="bg-primary-light text-white p-2 rounded-md text-sm">
                Attempt
              </button>
            </Link>
          </div>
        ))}
    </div>
  );
};

export default TestProvide;
