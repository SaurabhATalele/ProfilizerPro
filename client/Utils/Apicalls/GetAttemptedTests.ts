import { GET_ATTEMPTED_TEST } from "@/Utils/constants";

export const getAttemptedTests = async (): Promise<unknown> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  console.log("sending from GetAttemptedTests.ts", GET_ATTEMPTED_TEST);

  const response = await fetch(`${GET_ATTEMPTED_TEST}`, requestOptions);
  const data = await response.json();
  console.log(data);
  return data;
};
