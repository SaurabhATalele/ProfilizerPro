// const OpenAI = require('openai');
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ key: apiKey });

async function getGPT3Response(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    // Extract the generated response
    const answer = response.choices[0].message.content;

    return answer;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export default getGPT3Response;
