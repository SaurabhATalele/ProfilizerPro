import { LOGIN_API, REGISTER_API } from "../constants";

export const login = async (data) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    ...data,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("sending from login.js");

  const response = await fetch(`${LOGIN_API}`, requestOptions);
  const resposeData = await response.json();
  return response;
};

export const register = async (data) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    ...data,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  // console.log("sending from login.js");

  const response = await fetch(`${REGISTER_API}`, requestOptions);
  const resposeData = await response.json();
  return response;
};
