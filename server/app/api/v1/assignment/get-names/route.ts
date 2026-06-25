import { getAssignments } from "@/Utils/api/Controllers/AssignmentController";
import { NextRequest, NextResponse } from "next/server";

interface AssignmentName {
  id: string;
  name: string;
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    let data = await getAssignments();
    const parsed = await data.json();

    const resp: AssignmentName[] = [];
    parsed.data.map((assignment: { _id: string; name: string }) => {
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
