import { BASE_BACKEND_URL } from "@/Utils/constants";

export const deleteAssignment = async (id: string): Promise<unknown> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "DELETE",
    headers: myHeaders,
    body: JSON.stringify({ id }),
    redirect: "follow",
  };

  const response = await fetch(`${BASE_BACKEND_URL}/api/v1/assignment`, requestOptions);
  const data = await response.json();
  console.log(data);
  return data;
};
