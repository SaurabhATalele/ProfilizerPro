import { getCookie } from "cookies-next";
import { LOGIN_API, REGISTER_API, VERIFY_USER } from "../constants";

interface LoginData {
  [key: string]: any;
}

interface RegisterData {
  [key: string]: any;
}

export const login = async (data: LoginData): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    ...data,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("sending from login.ts");

  const response = await fetch(`${LOGIN_API}`, requestOptions);
  return response;
};

export const register = async (data: RegisterData): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    ...data,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(`${REGISTER_API}`, requestOptions);
  return response;
};

export const sendRegistrationOtp = async (email: string): Promise<Response> => {
  return fetch("/api/v1/users/send-registration-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem("token");
};

export const getUser = async (): Promise<Response> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${getCookie("token")}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(`${VERIFY_USER}`, requestOptions);
  return response;
};
