import { getCookie } from "cookies-next";
import { ProfilePatchPayload } from "@/Utils/types/Profile";
import { BASE_BACKEND_URL } from "@/Utils/constants";

const PROFILE_API = `${BASE_BACKEND_URL}/api/v1/users/profile`;

export const updateProfile = async (
  data: ProfilePatchPayload,
): Promise<Response> => {
  const token = getCookie("token");
  const response = await fetch(PROFILE_API, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
};
