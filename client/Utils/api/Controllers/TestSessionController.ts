import TestSession from "../Models/TestSession";
import Assignment from "../Models/Assignment";
import {
  buildCustomAssignmentRecord,
  decidePersistence,
} from "@/Utils/builder/customAssignment";
import { generateTest, GenerateTestPrompt } from "./GenerateTestController";

const DEFAULT_CUSTOM_ICON = "/LandingImage/GenAss.svg";

interface SessionContext {
  mode: "assignment" | "custom";
  assignmentId?: string;
  customAssignmentId?: string;
  topic?: string;
  difficulty?: string;
  subtopics?: { name: string; questionCount: number }[];
}

interface QA {
  question: string;
  options: string[];
  answer: string;
}

/**
 * Generate a test, store it (with answers) as a TestSession owned by `owner`,
 * and return ONLY the questions + options (no answers) plus the session id.
 */
export const createTestSession = async (
  owner: string,
  prompt: GenerateTestPrompt,
  context: SessionContext,
): Promise<{ id: string; questions: { question: string; options: string[] }[] }> => {
  const generated = await generateTest(prompt);
  // Flatten subtopic -> questions[] into one ordered list (same order the UI used).
  const flat: QA[] = Object.values(generated).flat() as QA[];

  const session = await TestSession.create({
    owner,
    questions: flat,
    context,
    scored: false,
  });

  return {
    id: String(session._id),
    questions: flat.map((q) => ({ question: q.question, options: q.options })),
  };
};

/**
 * Grade a submitted session server-side and store the score immutably.
 * `answers` maps question index -> selected option text. The score is computed
 * from the stored answer key; the client's claimed score (if any) is ignored.
 */
export const gradeTestSession = async (
  owner: string,
  sessionId: string,
  answers: Record<string, string>,
): Promise<{ status: number; score?: number; total?: number; message?: string }> => {
  if (typeof sessionId !== "string" || !sessionId) {
    return { status: 400, message: "Invalid session" };
  }

  const session: any = await TestSession.findById(sessionId).catch(() => null);
  if (!session) {
    return { status: 404, message: "Test session not found" };
  }
  if (session.owner !== owner) {
    return { status: 403, message: "Insufficient permissions" };
  }
  // Immutable: a scored session cannot be re-graded or changed.
  if (session.scored) {
    return { status: 200, score: session.score, total: session.total };
  }

  const questions: QA[] = session.questions;
  const total = questions.length;
  let correct = 0;
  const answered: { question: string; answer: string; yourAnswer: string }[] = [];
  for (let i = 0; i < total; i++) {
    const yourAnswer =
      answers && typeof answers[String(i)] === "string" ? answers[String(i)] : "";
    if (yourAnswer === questions[i].answer) correct++;
    answered.push({
      question: questions[i].question,
      answer: questions[i].answer,
      yourAnswer: yourAnswer || "Not answered",
    });
  }

  // Lock the score on the session first (source of truth, immutable).
  session.scored = true;
  session.score = correct;
  session.total = total;
  await session.save();

  // Record the attempt into the appropriate assignment for history/analytics.
  const ctx: SessionContext = session.context;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const attempt = {
    email: owner,
    score: percent,
    correct,
    total,
    questions: answered,
    date: new Date(),
  };

  try {
    if (ctx.mode === "assignment" && ctx.assignmentId) {
      const assignment: any = await Assignment.findById(ctx.assignmentId).catch(
        () => null,
      );
      if (assignment) {
        assignment.attemptedBy = assignment.attemptedBy || [];
        assignment.attemptedBy.push(attempt);
        await assignment.save();
      }
    } else if (ctx.mode === "custom") {
      const mode = decidePersistence(ctx.customAssignmentId);
      if (mode === "append") {
        const doc: any = await Assignment.findById(
          ctx.customAssignmentId,
        ).catch(() => null);
        if (doc && doc.owner === owner) {
          doc.attemptedBy = doc.attemptedBy || [];
          doc.attemptedBy.push(attempt);
          await doc.save();
        }
      } else {
        const record = buildCustomAssignmentRecord({
          owner,
          topic: ctx.topic || "Custom Assessment",
          subtopics: (ctx.subtopics || []).map((s) => ({
            name: s.name,
            selected: true,
            questionCount: s.questionCount,
            source: "custom" as const,
          })),
          difficulty: ctx.difficulty,
          attempt,
        });
        const name = record.name.length >= 3 ? record.name : `${record.name} Test`;
        await Assignment.create({ ...record, name, icon: DEFAULT_CUSTOM_ICON });
      }
    }
  } catch (error) {
    console.log("attempt recording failed:", error);
    // Score is already locked on the session; recording failure is non-fatal.
  }

  return { status: 200, score: correct, total };
};
