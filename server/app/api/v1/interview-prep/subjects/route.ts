import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/Utils/api/Controllers/SubjectController";
import {
  SubjectCreateSchema,
  SubjectUpdateSchema,
} from "@/Utils/validation/interviewPrepSchemas";

// Admin-only Subject management. requireAdmin is stacked on every method.

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const parsed = SubjectCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const result = await createSubject(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    return NextResponse.json({ subject: result.subject }, { status: 201 });
  } catch (error) {
    console.error("interview-prep/subjects POST error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const parsed = SubjectUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const { _id, ...patch } = parsed.data;
    const result = await updateSubject(_id, patch);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ subject: result.subject }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/subjects PUT error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "missing_id" }, { status: 400 });
    }
    const result = await deleteSubject(id);
    if (!result.ok) {
      // has_children -> 409 (blocked); not_found -> 404.
      const status = result.error === "has_children" ? 409 : 404;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/subjects DELETE error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
