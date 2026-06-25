import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/Utils/api/auth";
import connectdb from "@/Utils/api/db/connectDB";
import {
  parseJD,
  resolveJDInput,
  type JDInputCandidate,
} from "@/Utils/api/Controllers/JDParserController";
import { LLMTimeoutError } from "@/Utils/api/llm/LLMClient";

interface PasteBody {
  text?: string;
}

/**
 * POST /api/v1/jd-generator/parse — Stage 1.
 *
 * Accepts either a pasted JD (`application/json` → `{ text }`) or a file upload
 * (`multipart/form-data` with a `file` field and an optional `text` field).
 * Resolves the single JD source via `resolveJDInput`, then runs `parseJD`.
 *
 * Auth is required (any authenticated user); the creating identity comes from
 * the JWT, never the body.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ message: "Access denied" }, { status: 401 });
  }

  try {
    await connectdb();
    const userId = user.userId ?? user.email;

    // Build the raw input candidate from whichever body shape was sent.
    const candidate: JDInputCandidate = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const pasteText = form.get("text");
      if (typeof pasteText === "string") {
        candidate.pasteText = pasteText;
      }
      const file = form.get("file");
      if (file && typeof file !== "string") {
        candidate.upload = {
          filename: file.name,
          text: await file.text(),
        };
      }
    } else {
      const body = (await req.json()) as PasteBody;
      if (typeof body?.text === "string") {
        candidate.pasteText = body.text;
      }
    }

    const resolved = resolveJDInput(candidate);
    if (!resolved.ok) {
      // unsupported_file / no_input — both are bad requests.
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const result = await parseJD(resolved.rawText, resolved.sourceType, userId);
    if (!result.ok) {
      // too_short | parse_failed | not_a_job_description
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { jobDescriptionId: result.jobDescriptionId, parsed: result.parsed },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof LLMTimeoutError) {
      return NextResponse.json({ error: "llm_timeout" }, { status: 504 });
    }
    console.error("jd-generator/parse error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
