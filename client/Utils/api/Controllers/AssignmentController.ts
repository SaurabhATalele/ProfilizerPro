import Assignment from "../Models/Assignment";
import User from "../Models/Users";
import mongoose from "mongoose";
import nodeMailer from "nodemailer";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../constants";
import { headers } from "next/headers";
import connectDB from "../db/connectDB";

export const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASS_KEY,
  },
});

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

export const updateScore = async (body: ScoreBody): Promise<NextResponse> => {
  try {
    const { id, email, score, total, questions } = body;
    const assignment = await Assignment.findById(id);
    const correct = score;
    const myScore = (score / total) * 100;
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
    const headersList = headers();
    const token = headersList.get("authorization")!.split(" ")[0];
    if (!token) {
      return NextResponse.json({ message: "Access denied" }, { status: 401 });
    }
    let user: { email: string; [key: string]: unknown };
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
    const resp = assignments.map((assignment: { name: string; attemptedBy: Array<{ email: string }> }) => {
      const attempts = assignment.attemptedBy.filter(
        (attempt) => attempt.email === user.email,
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
    connectDB();
    const assignments = await Assignment.find();
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
