import { CONTACT_US } from "../constants";

interface ContactUsData {
  [key: string]: unknown;
}

export const contactUs = async (data: ContactUsData): Promise<unknown> => {
  try {
    const response = await fetch(`${CONTACT_US}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
