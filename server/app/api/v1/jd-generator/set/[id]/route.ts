import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";
import {
  editQuestion,
  deleteQuestion,
  addQuestion,
  type SetMutationResult,
} from "@/Utils/api/Controllers/JDGeneratorController";
import { SetPatchSchema } from "@/Utils/validation/jdGeneratorSchemas";
import { LLMTimeoutError } from "@/Utils/api/llm/LLMClient";

/**
 * PATCH /api/v1/jd-generator/set/[id] — review edits.
 *
 * Body is a discriminated union validated by `SetPatchSchema`:
 *   `{ op: "edit", index, question }` | `{ op: "delete", index }` | `{ op: "add", question }`.
 * Returns the updated set.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }

  try {
    await connectdb();
    const setId = (await params).id;

    const raw = await req.json();
    const parsed = SetPatchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bad_request", details: parsed.error.message },
        { status: 400 },
      );
    }

    const body = parsed.data;
    let result: SetMutationResult;
    switch (body.op) {
      case "edit":
        result = await editQuestion(setId, body.index, body.question);
        break;
      case "delete":
        result = await deleteQuestion(setId, body.index);
        break;
      case "add":
        result = await addQuestion(setId, body.question);
        break;
    }

    if (!result.ok) {
      const status = result.error === "not_found" ? 404 : 400; // bad_index → 400
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ set: result.set }, { status: 200 });
  } catch (error) {
    if (error instanceof LLMTimeoutError) {
      return NextResponse.json({ error: "llm_timeout" }, { status: 504 });
    }
    console.error("jd-generator/set error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
