import { getCookie } from "cookies-next";
import { ProfilePatchPayload } from "@/Utils/types/Profile";

const PROFILE_API = "/api/v1/users/profile";

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
