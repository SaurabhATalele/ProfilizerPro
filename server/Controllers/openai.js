// const OpenAI = require('openai');
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ key: apiKey });

async function getGPT3Response(prompt) {
  const data =
    "I have given you a json which will contain the  name of the topic and number of questions required on that topic (they are specified in the json) In " +
    prompt.tech +
    `. give me a array of json of questions, options and answers on the topics. the json is :  ${prompt.questions}. 
    I want tehe answer only in {\n    'Data types': [{'question': 'What is the data type of 5?',
    'options': ['Integer', 'String', 'Boolean', 'Float'],'answer': 'Integer'},
    {'question': 'Which data type is used to represent True or False?',
    'options': ['String', 'Boolean', 'Integer', 'Float'],'answer': 'Boolean'},
    ,
    'basics': [{'question': 'What is the result of 2 + 3?','options': ['4', '6', '5', '7'],
    'answer': '5'},{'question': 'Which data type is used to store text?',
    'options': ['String', 'Integer', 'Boolean', 'Array'],'answer': 'String'} 
    this format. I want nothong apart form the json object and there should be 4 options to every question`;

  try {
    let response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    let prompt2 = `give me the json data and no other information is required. The data is ${response.choices[0].message.content}`;

    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt2 },
      ],
    });
    // Extract the generated response
    const answer = response.choices[0].message.content;
    // console.log(answer);
    return answer;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export default getGPT3Response;
