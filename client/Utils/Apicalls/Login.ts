import { LOGIN_API } from "../constants";

interface LoginData {
  [key: string]: unknown;
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

  console.log("sending from Login.ts");

  const response = await fetch(`${LOGIN_API}`, requestOptions);
  return response;
};
