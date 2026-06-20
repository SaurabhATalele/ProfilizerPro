import { GET_ASSIGNMENTS } from "@/Utils/constants";

interface Assignment {
  _id: string;
  id: string;
  name: string;
}

interface AssignmentsResponse {
  data: Assignment[];
}

export const getAssignments = async (): Promise<AssignmentsResponse> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(`${GET_ASSIGNMENTS}`, requestOptions);
  const data = await response.json();
  return data;
};
