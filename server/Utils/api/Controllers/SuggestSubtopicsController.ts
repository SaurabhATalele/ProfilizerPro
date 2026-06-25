import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Returns a list of distinct, non-empty suggested subtopic names for a topic
 * using Google Gemini via the Vercel AI SDK. Mirrors the `generateTest`
 * controller pattern (Gemini `generateText`, markdown-fence stripping, JSON
 * parsing) and normalizes the model output to distinct, non-empty strings.
 */
export const suggestSubtopics = async (topic: string): Promise<string[]> => {
  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: `Return a JSON array of 6-10 concise subtopic names for the subject "${topic}".
            Return ONLY a JSON array of strings, e.g. ["Subtopic A", "Subtopic B"].
            No prose, no code fences.`,
  });

  // Strip any markdown code fences the model may wrap the JSON in.
  const content = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a list of subtopics");
  }

  // Normalize: trim, drop empties, dedup case-insensitively, preserve order.
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of parsed) {
    if (typeof item !== "string") continue;
    const name = item.trim();
    if (name.length === 0) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
};
