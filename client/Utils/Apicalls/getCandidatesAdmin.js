import { GET_CANDIDATES_ADMIN } from "../constants";

export const getCandidatesAdmin = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${localStorage.getItem("token")}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(`${GET_CANDIDATES_ADMIN}`, requestOptions);
  const data = await response.json();
  return data;
};
