import Assignment from "../Models/Assignment.js";
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
  console.log(process.env.PASS_KEY);
  const { email, subject, text, assignment, deadline } = req.body;
  const user = req.user;
  const dl = new Date();
  dl.setDate(dl.getDate() + deadline);
  const d = new Date(dl);
  try {
    console.log(user, assignment);
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
      console.log(assigned);
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
  const { id, email, score, total, questions } = body;
  try {
    const assignment = await Assignment.findById(id);
    assignment.attemptedBy.push({ email, score, total, questions });
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
      console.log(token);
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
    console.log(error);
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
const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    await Assignment.findByIdAndRemove(id);
    res.status(200).json({ message: "Assignment deleted successfully." });
  } catch (error) {
    console.log(error);
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

// export the functions
module.exports = {
  getAttemptedAssignments,
  getAssignments,
  createAssignment,
  deleteAssignment,
  sendMail,
  updateScore,
  getAssignmentById,
  transporter,
};
