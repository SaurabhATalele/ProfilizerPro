import { UPDATE_ASSIGNMENT } from "../constants";

interface AssignmentData {
  [key: string]: unknown;
}

interface UpdateResponse {
  message: string;
  status: number;
  [key: string]: unknown;
}

export const updateAssignment = async (data: AssignmentData): Promise<UpdateResponse> => {
  try {
    const response = await fetch(`${UPDATE_ASSIGNMENT}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.log(error);
    return { message: "Error", status: 500 };
  }
};
