import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.GEMINI_API_KEY);
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ...

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ...
export default async function GenerateGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text)
    let withoutJSON = text.replace("```json", "");
    withoutJSON = withoutJSON.replace("```", "");
    const jsonData = JSON.parse(withoutJSON);
    console.log(jsonData);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

GenerateGemini(
  "I have given you a json which will contain the  name of the topic and number of questions required on that topic (they are specified in the json) In " +
    "python" +
    `. give me a array of json of questions, options and answers on the topics. the json is :  {basics of python:5,Pandas:5}. 
I want tehe answer only in {\n    'Data types': [{'question': 'What is the data type of 5?',
'options': ['Integer', 'String', 'Boolean', 'Float'],'answer': 'Integer'},
{'question': 'Which data type is used to represent True or False?',
'options': ['String', 'Boolean', 'Integer', 'Float'],'answer': 'Boolean'},
,'basics': [{'question': 'What is the result of 2 + 3?','options': ['4', '6', '5', '7'],
'answer': '5'},{'question': 'Which data type is used to store text?',
'options': ['String', 'Integer', 'Boolean', 'Array'],'answer': 'String'} 
this format. I want nothing apart form the json object and there should be 4 options to every question put any code block under backticks`
);
