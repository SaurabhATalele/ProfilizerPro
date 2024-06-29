const Skeleton = () => {
  return (
    <div className="w-full grid grid-cols-3 gap-3 justify-around items-center">
      {[1, 2, 3].map((i) => (
        <div className="h-80 flex flex-col flex-grow-0 items-center gap-4 rounded-md shadow-md p-4 dark:shadow-gray-500 bg-gray-50  ">
          <div className="w-24 h-24 bg-gray-200 animate-pulse"></div>
          <p className="text-lg bg-gray-200 h-7 w-full animate-pulse"></p>
          <p className="text-sm bg-gray-200 w-full line-clamp-3 text-justify h-3 animate-pulse"></p>
          <p className="text-sm bg-gray-200 w-full line-clamp-3 text-justify h-3 animate-pulse"></p>
          <p className="text-sm bg-gray-200 w-full line-clamp-3 text-justify h-3 animate-pulse"></p>
          <div>
            <button className="bg-gray-200 text-white p-2 rounded-md text-sm w-20 h-10 animate-pulse"></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
