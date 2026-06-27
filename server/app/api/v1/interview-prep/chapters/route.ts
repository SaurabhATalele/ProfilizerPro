import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/Utils/api/auth";
import {
  createChapter,
  updateChapter,
  deleteChapter,
} from "@/Utils/api/Controllers/ChapterController";
import {
  ChapterCreateSchema,
  ChapterUpdateSchema,
} from "@/Utils/validation/interviewPrepSchemas";

// Admin-only Chapter management. requireAdmin is stacked on every method.

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const parsed = ChapterCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const result = await createChapter(parsed.data);
    return NextResponse.json({ chapter: result.chapter }, { status: 201 });
  } catch (error) {
    console.error("interview-prep/chapters POST error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const parsed = ChapterUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }
    const { _id, ...patch } = parsed.data;
    const result = await updateChapter(_id, patch);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ chapter: result.chapter }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/chapters PUT error:", error);
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
    const result = await deleteChapter(id);
    if (!result.ok) {
      const status = result.error === "has_children" ? 409 : 404;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("interview-prep/chapters DELETE error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
