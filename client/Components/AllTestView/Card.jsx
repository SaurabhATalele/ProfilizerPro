import Image from "next/image";
import Link from "next/link";

const Card = ({tests}) => {
    return (
      <div className="w-full grid grid-cols-4 gap-3 justify-around items-center">
        {tests &&
          tests.map((test) => (
            <div className="h-80 flex flex-col flex-grow-0 items-center gap-4 rounded-md shadow-md p-4" key={test._id}>
              <Image
                src={test.icon}
                width={120}
                height={120}
                alt="General"
                className="w-24 h-24"
              />
              <p className="font-bold text-lg ">{test.name}</p>
              <p className="text-sm text-gray-500 h-40 truncate w-full">{test.description}</p>
              <Link href={`/test/${test._id}`}>
              <button className="bg-primary-light text-white p-2 rounded-md text-sm">
                Attempt
              </button>
            </Link>
            </div>
          ))}
        {/* <div className="flex flex-col items-center w-80 gap-4 rounded-md shadow-md p-4">
          <Image
            src={"https://img.icons8.com/color/240/java-coffee-cup-logo--v1.png"}
            width={120}
            height={120}
            alt="General"
            className="w-24 h-24"
          />
          <p className="font-bold text-lg ">Java</p>
          <p className="text-sm text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint,
            placeat ex eos sequi debitis, odit quasi quas libero expedita illum,
            quisquam neque quod quibusdam eius.
          </p>
          <button className="bg-primary-light text-white p-2 rounded-md text-sm">
            Attempt
          </button>
        </div> */}
      </div>
    );
  };

  export default Card;
  