import React from "react";

const TestsAttempted = ({ data }) => {
  return (
    <div className={" w-5/6 p-5 flex flex-col h-screen justify-between"}>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                Test name
              </th>
              <th scope="col" class="px-6 py-3">
                Correct
              </th>
              <th scope="col" class="px-6 py-3">
                Total
              </th>
              <th scope="col" class="px-6 py-3">
                Score
              </th>
              <th scope="col" class="px-6 py-3">
                <span class="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.data &&
              data.data.map((test) => {
                return test.attempts.map((item) => {
                  return (
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {test.assignmentName}
                      </th>
                      <td class="px-6 py-4">{item.score}</td>
                      <td class="px-6 py-4">{item.total}</td>
                      <td class="px-6 py-4">
                        {((item.score / item.total) * 100).toFixed(2)}%
                      </td>
                      <td class="px-6 py-4 text-right">
                        <a
                          href="#"
                          class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                });
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestsAttempted;
