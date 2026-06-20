import { GET_TOP_N_CANDIDATES } from "../constants";

interface TestDetails {
  n: number;
  id: string;
}

interface TopCandidateItem {
  _id: string;
  name: string;
  averageScore: number;
}

interface TopCandidatesResponse {
  data: TopCandidateItem[];
}

export const getTopCandidates = async (testDetails: TestDetails): Promise<TopCandidatesResponse> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: JSON.stringify(testDetails),
  };

  const response = await fetch(`${GET_TOP_N_CANDIDATES}`, requestOptions);
  const data = await response.json();
  return data;
};
