import Assignment from "../Models/Assignment.js";
import User from "../Models/Users.js";
import mongoose from "mongoose";
import nodeMailer from "nodemailer";
import { NextResponse } from "next/server.js";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../constants.js";
import { headers } from "next/headers";
import connectDB from "../db/connectDB.js";
// create a transporter object using the default gmail setup for nodemailer
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASS_KEY,
  },
});

const sendMail = async (req, res) => {
  const { email, subject, text, assignment, deadline } = req.body;
  const user = req.user;
  const dl = new Date();
  dl.setDate(dl.getDate() + deadline);
  const d = new Date(dl);
  try {
    const data = await Assignment.find({
      _id: assignment,
      organization: user.organization,
    });
    if (data.length === 0 || !data) {
      res
        .status(403)
        .json({ message: "You are not authorized to schedule assessment" });
    }
    const mailOptions = {
      from: "saurabhatalele@gmail.com",
      to: email,
      subject: subject,
      html: text,
    };
    await transporter.sendMail(mailOptions);

    const userDetails = {
      email: email,
      assignedOn: Date.now(),
      deadline: d,
    };
    const assigned = await Assignment.findOneAndUpdate(
      { _id: assignment, organization: user.organization },
      {
        $push: { AssignedTo: userDetails },
      },
    );
    if (!assigned) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    res.status(200).json({ message: "Mail sent successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// update the assignment score into the model
const updateScore = async (body) => {
  try {
    const { id, email, score, total, questions } = body;
    const assignment = await Assignment.findById(id);
    const correct = score;
    let myScore = (score / total) * 100;
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
    res.status(500).json({ message: "Something went wrong" });
  }
};

// update the assignment
const updateAssignment = async (body) => {
  try {
    const { id, name, description, icon, toipcs } = body;
    const assignment = await Assignment.findByIdAndUpdate(id, {
      name,
      description,
      icon,
      topics,
    });
    return { message: "Assignment updated successfully", status: 200 };
  } catch (error) {
    console.log(error);
    return { message: "Something went wrong" }, { status: 500 };
  }
};

// get all the assignments
const getAttemptedAssignments = async (req) => {
  try {
    let user;
    const headersList = headers();
    const token = headersList.get("authorization").split(" ")[0];
    if (!token) {
      return NextResponse.json({ message: "Access denied" }, { status: 401 });
    }
    try {
      user = jwt.verify(token, SECRET_KEY);
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
    const resp = assignments.map((assignment) => {
      const attempts = assignment.attemptedBy.filter(
        (attempt) => attempt.email === user.email,
      );
      const assignmentName = assignment.name;
      return { assignmentName, attempts };
    });

    return resp;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 404 });

    res.status(404).json({ message: error.message });
  }
};

// get the assignment by id
const getAssignmentById = async (body) => {
  const { id } = body;
  try {
    const assignment = await Assignment.findById(id);
    return NextResponse.json({ data: assignment }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
};

// get all the assignments by organization id
const getAssignments = async (req, res) => {
  try {
    connectDB();
    const assignments = await Assignment.find();

    return NextResponse.json({ data: assignments }, { status: 200 });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// create a new assignment
const createAssignment = async (body) => {
  const assignment = body;
  const newAssignment = new Assignment(assignment);
  try {
    await newAssignment.save();
    return NextResponse.json({ newAssignment }, { status: 201 });
    res.status(201).json({ newAssignment });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 409 });
    res.status(409).json({ message: error.message });
  }
};

// deleting an assignment
const deleteAssignment = async (body) => {
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

// Assigning an assignment to a candidate
const AssignToCandidate = async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  try {
    const assignment = await Assignment.findById(id);
    assignment.AssignedTo.push(data);
    await assignment.save();
    res.status(200).json({ assignment });
  } catch (error) {
    console.log(error);
  }
};

// get the top N candidates who has taken the tests
const getTopNCandidates = async (body) => {
  const { id, n } = body;
  try {
    // const assignmentId = "your_assignment_id_here";

    const data = await Assignment.find({ _id: new mongoose.Types.ObjectId(id) })
      .populate("attemptedBy.email")
      .exec()
      .then((assignments) => {
        return Assignment.aggregate([
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
      });
    for (let i = 0; i < data.length; i++) {
      const user = await User.findOne({ email: data[i]._id });

      data[i].name = user?.username;
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

// get the number of candidates who has taken the test
const getCandidatesByMonths = async () => {
  try {
    const data = await Assignment.aggregate([
      // Unwind the attemptedBy array to create a document for each attempted test
      { $unwind: "$attemptedBy" },
      // Project only the fields needed for grouping
      {
        $project: {
          month: { $month: { $toDate: "$attemptedBy.date" } },
          year: { $year: { $toDate: "$attemptedBy.date" } },
          email: "$attemptedBy.email",
          test: "$name",
        },
      },
      // Group documents by month and test, and count the number of candidates
      {
        $group: {
          _id: { month: "$month", year: "$year", test: "$test" },
          candidates: { $addToSet: "$email" }, // Use $addToSet to ensure unique emails
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          candidates: 1,
          count: { $size: "$candidates" }, // Use $size to count the number of unique candidates
        },
      },
    ]).exec();

    return data;
  } catch (error) {}
};

// export the functions
module.exports = {
  getAttemptedAssignments,
  getAssignments,
  createAssignment,
  deleteAssignment,
  sendMail,
  updateScore,
  updateAssignment,
  getAssignmentById,
  getTopNCandidates,
  getCandidatesByMonths,
};
