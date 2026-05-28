const Skeleton = () => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex-1"></div>
          </div>
          <div className="flex flex-col gap-2 flex-1 mt-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse w-4/6"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
