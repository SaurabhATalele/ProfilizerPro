import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

// Shape of a single generated MCQ question.
const questionSchema = z.object({
  question: z.string().describe("The question text"),
  options: z
    .array(z.string())
    .length(4)
    .describe("Exactly four answer options"),
  answer: z.string().describe("The correct option text, matching one of the options exactly"),
});

export interface GenerateTestPrompt {
  topic: string;
  // JSON-stringified Record<string, string|number> mapping subtopic -> question count
  questions: string;
}

export type GeneratedQuestion = z.infer<typeof questionSchema>;
export type GeneratedResponse = Record<string, GeneratedQuestion[]>;

/**
 * Generates multiple-choice questions for a test using Google Gemini via the
 * Vercel AI SDK. Returns a map of subtopic -> question[], matching the shape
 * consumed by the exam UI (`res.data.response`).
 */
export const generateTest = async (
  prompt: GenerateTestPrompt,
): Promise<GeneratedResponse> => {
  const { topic, questions } = prompt;

  // Parse the requested subtopics and their question counts.
  let subtopics: Record<string, number>;
  try {
    const parsed = JSON.parse(questions) as Record<string, string | number>;
    subtopics = Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, Number(v) || 1]),
    );
  } catch {
    throw new Error("Invalid 'questions' payload: expected a JSON object of subtopic -> count");
  }

  if (Object.keys(subtopics).length === 0) {
    throw new Error("No subtopics provided");
  }

  const breakdown = Object.entries(subtopics)
    .map(([sub, count]) => `- ${sub}: ${count} question(s)`)
    .join("\n");

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: `Give me an array of JSON of questions, options and answers on the topics for the subject "${topic}".
            The requested subtopics and their question counts are:
            ${breakdown}

            Return the answer only in this format (one key per subtopic):
            {
              "Data types": [
                { "question": "What is the data type of 5?", "options": ["Integer", "String", "Boolean", "Float"], "answer": "Integer" },
                { "question": "Which data type is used to represent True or False?", "options": ["String", "Boolean", "Integer", "Float"], "answer": "Boolean" }
              ],
              "basics": [
                { "question": "What is the result of 2 + 3?", "options": ["4", "6", "5", "7"], "answer": "5" },
                { "question": "Which data type is used to store text?", "options": ["String", "Integer", "Boolean", "Array"], "answer": "String" }
              ]
            }

            Rules:
            - There must be exactly 4 options for every question.
            - The "answer" must exactly match one of the 4 options.
            - Generate exactly the requested number of questions per subtopic.
            - Return nothing apart from the JSON object.`,
  });

  // Strip any markdown code fences the model may wrap the JSON in.
  const content = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: GeneratedResponse;
  try {
    parsed = JSON.parse(content) as GeneratedResponse;
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  // Keep only well-formed questions (4 options + an answer that matches one).
  const response: GeneratedResponse = {};
  for (const [subtopic, items] of Object.entries(parsed)) {
    if (!Array.isArray(items)) continue;
    response[subtopic] = items.filter(
      (q) =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.answer === "string" &&
        q.options.includes(q.answer),
    );
  }

  return response;
};
