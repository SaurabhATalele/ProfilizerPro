import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Task 7.2 — Route-handler tests: auth gating + LLM timeout mapping.
//
// These tests exercise the five JD-generator API route handlers WITHOUT any
// real auth, LLM, or DB access. Everything at the route's boundaries is mocked:
//   * @/Utils/api/auth          -> getAuthUser is a spy (null = unauthenticated)
//   * @/Utils/api/db/connectDB  -> default export is a no-op spy
//   * the three controllers     -> spies returning canned results
//
// The real LLMTimeoutError class is imported (LLMClient is NOT mocked) so the
// `error instanceof LLMTimeoutError` branch in each route maps to a real 504.
//
// Requirements: 1.1 (auth required), 1.2 (any authenticated user — no admin
// gate), 1.3 (identity from JWT, controller invoked on success), 10.3 (LLM
// timeout -> 504).
// ---------------------------------------------------------------------------

const {
  mockGetAuthUser,
  mockConnect,
  // JDParserController
  mockParseJD,
  mockResolveJDInput,
  // QuestionGeneratorController
  mockGenerateQuestionSet,
  mockRegenerateQuestion,
  // JDGeneratorController
  mockApproveAsTest,
  mockEditQuestion,
  mockDeleteQuestion,
  mockAddQuestion,
} = vi.hoisted(() => ({
  mockGetAuthUser: vi.fn(),
  mockConnect: vi.fn(),
  mockParseJD: vi.fn(),
  mockResolveJDInput: vi.fn(),
  mockGenerateQuestionSet: vi.fn(),
  mockRegenerateQuestion: vi.fn(),
  mockApproveAsTest: vi.fn(),
  mockEditQuestion: vi.fn(),
  mockDeleteQuestion: vi.fn(),
  mockAddQuestion: vi.fn(),
}));

vi.mock("@/Utils/api/auth", () => ({
  getAuthUser: mockGetAuthUser,
}));

vi.mock("@/Utils/api/db/connectDB", () => ({
  default: mockConnect,
}));

vi.mock("@/Utils/api/Controllers/JDParserController", () => ({
  parseJD: mockParseJD,
  resolveJDInput: mockResolveJDInput,
}));

vi.mock("@/Utils/api/Controllers/QuestionGeneratorController", () => ({
  generateQuestionSet: mockGenerateQuestionSet,
  regenerateQuestion: mockRegenerateQuestion,
}));

vi.mock("@/Utils/api/Controllers/JDGeneratorController", () => ({
  approveAsTest: mockApproveAsTest,
  editQuestion: mockEditQuestion,
  deleteQuestion: mockDeleteQuestion,
  addQuestion: mockAddQuestion,
}));

// NOTE: LLMClient is intentionally NOT mocked so the real LLMTimeoutError is
// used both by the routes and by these tests.
import { LLMTimeoutError } from "@/Utils/api/llm/LLMClient";

import { POST as parsePOST } from "@/app/api/v1/jd-generator/parse/route";
import { POST as generatePOST } from "@/app/api/v1/jd-generator/generate/route";
import { POST as regeneratePOST } from "@/app/api/v1/jd-generator/regenerate/route";
import { POST as approvePOST } from "@/app/api/v1/jd-generator/approve/route";
import { PATCH as setPATCH } from "@/app/api/v1/jd-generator/set/[id]/route";

import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Request builders. The routes type their first argument as `NextRequest`, but
// only use `.headers.get`, `.json`, and `.formData` — all present on a plain
// `Request` — so we build `Request`s and cast.
// ---------------------------------------------------------------------------

const jsonRequest = (url: string, body: unknown): NextRequest =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

const patchRequest = (url: string, body: unknown): NextRequest =>
  new Request(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;

const VALID_USER = {
  userId: "user-1",
  email: "user@example.com",
  username: "user",
  isAdmin: false, // explicitly a NON-admin: must still be allowed (Req 1.2)
};

// A valid PATCH body that passes SetPatchSchema without exercising the full
// GeneratedQuestionSchema (delete only needs op + index).
const DELETE_PATCH_BODY = { op: "delete", index: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  mockConnect.mockResolvedValue(undefined);

  // Default happy-path resolutions so authenticated requests reach controllers.
  mockResolveJDInput.mockReturnValue({
    ok: true,
    rawText: "a".repeat(400),
    sourceType: "paste",
  });
  mockParseJD.mockResolvedValue({
    ok: true,
    jobDescriptionId: "jd-1",
    parsed: { role: "Engineer", seniority: "mid", skills: [], mustHave: [], niceToHave: [] },
  });
  mockGenerateQuestionSet.mockResolvedValue({
    ok: true,
    set: { _id: "set-1", questions: [] },
    shortfall: null,
  });
  mockRegenerateQuestion.mockResolvedValue({
    ok: true,
    set: { _id: "set-1", questions: [] },
  });
  mockApproveAsTest.mockResolvedValue({ ok: true, testId: "test-1" });
  mockDeleteQuestion.mockResolvedValue({
    ok: true,
    set: { _id: "set-1", questions: [] },
  });
  mockEditQuestion.mockResolvedValue({
    ok: true,
    set: { _id: "set-1", questions: [] },
  });
  mockAddQuestion.mockResolvedValue({
    ok: true,
    set: { _id: "set-1", questions: [] },
  });
});

// ===========================================================================
// Auth gating — unauthenticated (getAuthUser -> null) yields 401 and NEVER
// invokes the controller (Req 1.1).
// ===========================================================================

describe("Auth gating: unauthenticated requests are rejected with 401 (Req 1.1)", () => {
  beforeEach(() => {
    mockGetAuthUser.mockResolvedValue(null);
  });

  it("parse: returns 401 and never calls the parser controller", async () => {
    const res = await parsePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/parse", {
        text: "a".repeat(400),
      }),
    );
    expect(res.status).toBe(401);
    expect(mockParseJD).not.toHaveBeenCalled();
    expect(mockResolveJDInput).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("generate: returns 401 and never calls the generator controller", async () => {
    const res = await generatePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/generate", {
        jobDescriptionId: "jd-1",
        confirmedSignal: {},
        mix: {},
        difficulty: "mixed",
      }),
    );
    expect(res.status).toBe(401);
    expect(mockGenerateQuestionSet).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("regenerate: returns 401 and never calls the regenerate controller", async () => {
    const res = await regeneratePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/regenerate", {
        generatedQuestionSetId: "set-1",
        index: 0,
      }),
    );
    expect(res.status).toBe(401);
    expect(mockRegenerateQuestion).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("approve: returns 401 and never calls the approve controller", async () => {
    const res = await approvePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/approve", {
        generatedQuestionSetId: "set-1",
        title: "T",
        duration: 30,
        passingScore: 50,
      }),
    );
    expect(res.status).toBe(401);
    expect(mockApproveAsTest).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("set/[id]: returns 401 and never calls any set-mutation controller", async () => {
    const res = await setPATCH(
      patchRequest("http://localhost/api/v1/jd-generator/set/set-1", DELETE_PATCH_BODY),
      { params: { id: "set-1" } },
    );
    expect(res.status).toBe(401);
    expect(mockDeleteQuestion).not.toHaveBeenCalled();
    expect(mockEditQuestion).not.toHaveBeenCalled();
    expect(mockAddQuestion).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Auth gating — an authenticated NON-admin user is allowed through and the
// handler proceeds to invoke the controller, mapping success to 200
// (Req 1.2: no admin-role check; Req 1.3: controller invoked).
// ===========================================================================

describe("Auth gating: an authenticated non-admin user is allowed through (Req 1.2, 1.3)", () => {
  beforeEach(() => {
    mockGetAuthUser.mockResolvedValue(VALID_USER);
  });

  it("parse: proceeds to the controller and returns 200", async () => {
    const res = await parsePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/parse", {
        text: "a".repeat(400),
      }),
    );
    expect(res.status).toBe(200);
    expect(mockParseJD).toHaveBeenCalledTimes(1);
    // Identity comes from the JWT, never the body (Req 1.3).
    expect(mockParseJD).toHaveBeenCalledWith(
      expect.any(String),
      "paste",
      VALID_USER.userId,
    );
    await expect(res.json()).resolves.toEqual({
      jobDescriptionId: "jd-1",
      parsed: expect.any(Object),
    });
  });

  it("generate: proceeds to the controller and returns 200", async () => {
    const res = await generatePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/generate", {
        jobDescriptionId: "jd-1",
        confirmedSignal: {},
        mix: {},
        difficulty: "mixed",
      }),
    );
    expect(res.status).toBe(200);
    expect(mockGenerateQuestionSet).toHaveBeenCalledTimes(1);
    expect(mockGenerateQuestionSet).toHaveBeenCalledWith(
      expect.any(Object),
      VALID_USER.userId,
    );
  });

  it("regenerate: proceeds to the controller and returns 200", async () => {
    const res = await regeneratePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/regenerate", {
        generatedQuestionSetId: "set-1",
        index: 2,
      }),
    );
    expect(res.status).toBe(200);
    expect(mockRegenerateQuestion).toHaveBeenCalledTimes(1);
    expect(mockRegenerateQuestion).toHaveBeenCalledWith("set-1", 2, VALID_USER.userId);
  });

  it("approve: proceeds to the controller and returns 200", async () => {
    const res = await approvePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/approve", {
        generatedQuestionSetId: "set-1",
        title: "My Test",
        duration: 30,
        passingScore: 50,
      }),
    );
    expect(res.status).toBe(200);
    expect(mockApproveAsTest).toHaveBeenCalledTimes(1);
    await expect(res.json()).resolves.toEqual({ testId: "test-1" });
  });

  it("set/[id]: proceeds to the mutation controller (delete) and returns 200", async () => {
    const res = await setPATCH(
      patchRequest("http://localhost/api/v1/jd-generator/set/set-1", DELETE_PATCH_BODY),
      { params: { id: "set-1" } },
    );
    expect(res.status).toBe(200);
    expect(mockDeleteQuestion).toHaveBeenCalledTimes(1);
    expect(mockDeleteQuestion).toHaveBeenCalledWith("set-1", 0);
  });
});

// ===========================================================================
// LLM timeout mapping — when the controller rejects with a real
// LLMTimeoutError, the route maps it to status 504 (Req 10.3).
// ===========================================================================

describe("LLM timeout mapping: LLMTimeoutError -> 504 (Req 10.3)", () => {
  beforeEach(() => {
    mockGetAuthUser.mockResolvedValue(VALID_USER);
  });

  it("parse: returns 504 when the parser controller times out", async () => {
    mockParseJD.mockRejectedValueOnce(new LLMTimeoutError("LLM request timed out"));
    const res = await parsePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/parse", {
        text: "a".repeat(400),
      }),
    );
    expect(res.status).toBe(504);
    await expect(res.json()).resolves.toEqual({ error: "llm_timeout" });
  });

  it("generate: returns 504 when the generator controller times out", async () => {
    mockGenerateQuestionSet.mockRejectedValueOnce(new LLMTimeoutError());
    const res = await generatePOST(
      jsonRequest("http://localhost/api/v1/jd-generator/generate", {
        jobDescriptionId: "jd-1",
        confirmedSignal: {},
        mix: {},
        difficulty: "mixed",
      }),
    );
    expect(res.status).toBe(504);
    await expect(res.json()).resolves.toEqual({ error: "llm_timeout" });
  });
});
