import { GET_ATTEMPTED_TEST } from "@/Utils/constants";

interface AttemptedTestData {
  data: Array<{
    assignmentName: string;
    attempts: Array<{
      date: string;
      score: number;
      correct: number;
      total: number;
      questions: Array<{
        _id: string;
        question: string;
        answer: string;
        yourAnswer: string;
      }>;
    }>;
  }>;
}

export const getAttemptedTests = async (): Promise<AttemptedTestData> => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `${localStorage.getItem("token")}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  console.log("sending from GetAttemptedTests.ts", GET_ATTEMPTED_TEST);

  const response = await fetch(`${GET_ATTEMPTED_TEST}`, requestOptions);
  const data = await response.json();
  console.log(data);
  return data;
};
