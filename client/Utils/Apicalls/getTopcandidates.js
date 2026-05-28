import { GET_TOP_N_CANDIDATES } from "../constants";

export const getTopCandidates = async (testDetails) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: JSON.stringify(testDetails),
  };

  const response = await fetch(`${GET_TOP_N_CANDIDATES}`, requestOptions);
  const data = await response.json();
  return data;
};
