import { LOGIN_API, REGISTER_API, VERIFY_USER } from "../constants";

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
  return response;
};

export const logout = async () => {
  localStorage.removeItem("token");
};

export const getUser = async () => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${localStorage.getItem("token")}`);
  console.log(myHeaders, "from user.js");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(`${VERIFY_USER}`, requestOptions);
  // console.log(await response.json(), "from user.js");
  return response;
};
