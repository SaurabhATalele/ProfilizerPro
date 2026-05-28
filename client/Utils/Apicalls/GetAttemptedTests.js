import { GET_ATTEMPTED_TEST } from "../../Utils/constants.js";

export const getAttemptedTests = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  console.log("sending from getAttemptedTests.js", GET_ATTEMPTED_TEST);

  const response = await fetch(`${GET_ATTEMPTED_TEST}`, requestOptions);
  const data = await response.json();
  console.log(data);
  return data;
};
