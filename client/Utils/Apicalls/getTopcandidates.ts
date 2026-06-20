import { GET_TOP_N_CANDIDATES } from "../constants";

interface TestDetails {
  [key: string]: unknown;
}

export const getTopCandidates = async (testDetails: TestDetails): Promise<unknown> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: JSON.stringify(testDetails),
  };

  const response = await fetch(`${GET_TOP_N_CANDIDATES}`, requestOptions);
  const data = await response.json();
  return data;
};
