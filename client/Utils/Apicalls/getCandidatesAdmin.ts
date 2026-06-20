import { GET_CANDIDATES_ADMIN } from "../constants";

export const getCandidatesAdmin = async (): Promise<unknown> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(`${GET_CANDIDATES_ADMIN}`, requestOptions);
  const data = await response.json();
  return data;
};
