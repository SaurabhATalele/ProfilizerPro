import { getAssignments } from "@/Utils/api/Controllers/AssignmentController";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    let data = await getAssignments();
    data = await data.json();

    const resp = [];
    data.data.map((assignment) => {
      resp.push({
        id: assignment._id,
        name: assignment.name,
      });
    });

    return NextResponse.json({ data: resp });
  } catch (error) {
    return NextResponse.json({ message: error });
  }
}
