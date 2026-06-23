import { NextRequest, NextResponse } from "next/server";
import {
  createOrUpdateCustomAssignment,
  getCustomAssignmentById,
  getCustomAssignments,
} from "@/Utils/api/Controllers/AssignmentController";

export async function POST(req: NextRequest): Promise<NextResponse> {
  return createOrUpdateCustomAssignment(req);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // With ?id=<assignmentId> -> fetch a single owned custom assignment (prefill).
  // Without an id -> list the caller's recent custom assignments.
  if (req.nextUrl.searchParams.get("id")) {
    return getCustomAssignmentById(req);
  }
  return getCustomAssignments(req);
}
