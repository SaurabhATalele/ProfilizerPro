import { CONTACT_US } from "../constants";

export const contactUs = async (data) => {
  try {
    const response = await fetch(CONTACT_US, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};
