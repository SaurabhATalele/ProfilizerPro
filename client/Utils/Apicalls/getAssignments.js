import { GET_ASSIGNMENTS } from "../../Utils/constants.js";

export const getAssignments = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(`${GET_ASSIGNMENTS}`, requestOptions);
  const data = await response.json();
  return data;
};
