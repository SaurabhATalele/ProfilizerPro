import Assignment from "../Models/Assignment";
import User from "../Models/Users";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../constants";
import { headers } from "next/headers";
import connectDB from "../db/connectDB";
import {
  buildCustomAssignmentRecord,
  decidePersistence,
} from "@/Utils/builder/customAssignment";

interface ScoreBody {
  id: string;
  email: string;
  score: number;
  total: number;
  questions: unknown[];
}

interface UpdateBody {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  topics?: unknown[];
  [key: string]: unknown;
}

interface AssignmentIdBody {
  id: string;
}

interface DeleteBody {
  id: string;
}

interface TopCandidatesBody {
  id: string;
  n: number;
}

interface CustomSubmitBody {
  customAssignmentId?: string;
  topic: string;
  difficulty?: string;
  subtopics: { name: string; questionCount: number }[];
  attempt: {
    score: number;
    correct: number;
    total: number;
    questions: Array<{ question: string; answer: string; yourAnswer: string }>;
  };
}

export const updateScore = async (body: ScoreBody): Promise<NextResponse> => {
  try {
    const { id, email, score, total, questions } = body;
    const assignment: any = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }
    const correct = score;
    const myScore = (score / total) * 100;
    assignment.attemptedBy = assignment.attemptedBy || [];
    assignment.attemptedBy.push({
      email,
      score: myScore,
      correct,
      total,
      questions,
    });
    await assignment.save();
    return NextResponse.json(
      { message: "Attempted by inserted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
};

export const updateAssignment = async (body: UpdateBody): Promise<{ message: string; status: number }> => {
  try {
    const { id, name, description, icon, topics } = body;
    await Assignment.findByIdAndUpdate(id, {
      name,
      description,
      icon,
      topics,
    });
    return { message: "Assignment updated successfully", status: 200 };
  } catch (error) {
    console.log(error);
    return { message: "Something went wrong", status: 500 };
  }
};

export const getAttemptedAssignments = async (_req: unknown): Promise<unknown> => {
  try {
    const headersList = await headers();
    const token = headersList.get("authorization")!.split(" ")[0];
    if (!token) {
      return NextResponse.json({ message: "Access denied" }, { status: 401 });
    }
    let user: { email: string;[key: string]: unknown };
    try {
      user = jwt.verify(token, SECRET_KEY as string) as { email: string };
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }
    await connectDB();
    const assignments = await Assignment.find({
      attemptedBy: {
        $elemMatch: {
          email: user.email,
        },
      },
    });
    const resp = assignments.map((assignment: any) => {
      const attempts = assignment.attemptedBy.filter(
        (attempt: { email: string }) => attempt.email === user.email,
      );
      const assignmentName = assignment.name;
      return { assignmentName, attempts };
    });

    return resp;
  } catch (error: unknown) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 404 });
  }
};

export const getAssignmentById = async (body: AssignmentIdBody): Promise<NextResponse> => {
  const { id } = body;
  try {
    const assignment = await Assignment.findById(id);
    return NextResponse.json({ data: assignment }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 404 });
  }
};

export const getAssignments = async (): Promise<NextResponse> => {
  try {
    await connectDB();
    // Only return non-custom assignments. A test is "custom" if it is flagged
    // isCustom OR has a non-empty owner; exclude both so custom tests never
    // appear in the general listing (home page / all-tests grid).
    const assignments = await Assignment.find({
      isCustom: { $ne: true },
      $or: [{ owner: { $exists: false } }, { owner: "" }, { owner: null }],
    });
    return NextResponse.json({ data: assignments }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 404 });
  }
};

export const createAssignment = async (body: unknown): Promise<NextResponse> => {
  const assignment = body;
  console.log(assignment);
  const newAssignment = new Assignment(assignment);
  try {
    await newAssignment.save();
    return NextResponse.json({ newAssignment }, { status: 201 });
  } catch (error: unknown) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 409 });
  }
};

export const deleteAssignment = async (body: DeleteBody): Promise<string> => {
  const { id } = body;
  try {
    console.log("Inside delete");
    const data = await Assignment.findByIdAndDelete(id);
    console.log("removed Data is", data);
    return "Assignment deleted successfully";
  } catch (error) {
    console.log(error);
    return "Something went wrong";
  }
};

export const getTopNCandidates = async (body: TopCandidatesBody): Promise<unknown> => {
  const { id, n } = body;
  try {
    await Assignment.find({ _id: new mongoose.Types.ObjectId(id) })
      .populate("attemptedBy.email")
      .exec();

    const data = await Assignment.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$attemptedBy" },
      {
        $group: {
          _id: "$attemptedBy.email",
          averageScore: { $avg: "$attemptedBy.score" },
        },
      },
      { $sort: { averageScore: -1 } },
      { $limit: n },
    ]).exec();

    for (let i = 0; i < data.length; i++) {
      const user = await User.findOne({ email: data[i]._id });
      data[i].name = user?.username;
    }
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getCandidatesByMonths = async (): Promise<unknown> => {
  try {
    const data = await Assignment.aggregate([
      { $unwind: "$attemptedBy" },
      {
        $project: {
          month: { $month: { $toDate: "$attemptedBy.date" } },
          year: { $year: { $toDate: "$attemptedBy.date" } },
          email: "$attemptedBy.email",
          test: "$name",
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year", test: "$test" },
          candidates: { $addToSet: "$email" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          candidates: 1,
          count: { $size: "$candidates" },
        },
      },
    ]).exec();

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const DEFAULT_CUSTOM_ICON = "/LandingImage/GenAss.svg";

/**
 * Resolve the owner email from the JWT carried in the Authorization header.
 * Mirrors the getAttemptedAssignments convention: the client sends the raw
 * token (no "Bearer " prefix), but we also accept a "Bearer <token>" form by
 * taking the last space-separated segment. Returns null on a missing/invalid
 * token.
 */
async function resolveOwnerEmail(): Promise<string | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (!authHeader) {
      return null;
    }
    const parts = authHeader.split(" ");
    const token = parts[parts.length - 1];
    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, SECRET_KEY as string) as {
      email: string;
    };
    return decoded.email ?? null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Create a new Custom_Assignment, or append the attempt to an existing one.
 * - owner resolved from JWT (Req 13.2)
 * - decidePersistence(customAssignmentId): "append" | "create" (Req 15.3)
 * - append path verifies record.owner === owner (Req 15.4), else 403/404
 * - create path builds the record via buildCustomAssignmentRecord and saves
 * - on any failure -> 500 with descriptive message (Req 13.4)
 */
export const createOrUpdateCustomAssignment = async (
  req: NextRequest,
): Promise<NextResponse> => {
  try {
    await connectDB();

    const owner = await resolveOwnerEmail();
    if (!owner) {
      return NextResponse.json({ message: "Access denied" }, { status: 401 });
    }

    const body = (await req.json()) as CustomSubmitBody;

    // Sanitize questions: the schema requires non-empty question/answer/yourAnswer.
    // Unanswered questions arrive with an undefined yourAnswer, which would fail
    // validation and silently abort the whole save — default them instead.
    const sanitizedQuestions = (body.attempt?.questions || []).map((q) => ({
      question: q.question || "Question",
      answer: q.answer || "—",
      yourAnswer: q.yourAnswer || "Not answered",
    }));

    const attempt = {
      email: owner,
      score: body.attempt.score,
      correct: body.attempt.correct,
      total: body.attempt.total,
      questions: sanitizedQuestions,
      date: new Date(),
    };

    const mode = decidePersistence(body.customAssignmentId);

    if (mode === "append") {
      const doc: any = await Assignment.findById(body.customAssignmentId);
      if (!doc) {
        return NextResponse.json(
          { message: "Custom assessment not found" },
          { status: 404 },
        );
      }
      if (doc.owner !== owner) {
        return NextResponse.json(
          { message: "Insufficient permissions" },
          { status: 403 },
        );
      }
      doc.attemptedBy = doc.attemptedBy || [];
      doc.attemptedBy.push(attempt);
      await doc.save();
      return NextResponse.json(
        { message: "Attempt recorded", id: doc._id },
        { status: 200 },
      );
    }

    const record = buildCustomAssignmentRecord({
      owner,
      topic: body.topic,
      subtopics: body.subtopics.map((s) => ({
        name: s.name,
        selected: true,
        questionCount: s.questionCount,
        source: "custom",
      })),
      difficulty: body.difficulty,
      attempt,
    });

    // The schema requires name minLength 3; pad short topics defensively.
    const safeName = record.name.length >= 3 ? record.name : `${record.name} Test`;

    const newDoc = new Assignment({
      ...record,
      name: safeName,
      isCustom: true,
      owner,
      icon: DEFAULT_CUSTOM_ICON,
    });
    await newDoc.save();
    return NextResponse.json(
      { message: "Custom assessment saved", id: newDoc._id },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
};

/**
 * Owner-checked fetch of a single custom assignment for prefill (Req 15.1, 15.4).
 */
export const getCustomAssignmentById = async (
  req: NextRequest,
): Promise<NextResponse> => {
  try {
    await connectDB();

    const owner = await resolveOwnerEmail();
    if (!owner) {
      return NextResponse.json({ message: "Access denied" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing 'id'" }, { status: 400 });
    }

    const doc = await Assignment.findById(id);
    if (!doc) {
      return NextResponse.json(
        { message: "Custom assessment not found" },
        { status: 404 },
      );
    }
    if (!doc.isCustom || doc.owner !== owner) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 },
      );
    }

    return NextResponse.json({ data: doc }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
};

/**
 * List all custom assignments owned by the caller (Req 14.2 "my custom tests").
 */
export const getCustomAssignments = async (
  _req: NextRequest,
): Promise<NextResponse> => {
  try {
    await connectDB();

    const owner = await resolveOwnerEmail();
    if (!owner) {
      return NextResponse.json({ message: "Access denied" }, { status: 401 });
    }

    // Most recent first (ObjectId is time-ordered), capped at 10.
    const data = await Assignment.find({ isCustom: true, owner })
      .sort({ _id: -1 })
      .limit(10);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
};
