// Client-side API wrappers for the JD Question Generator feature.
//
// Mirrors the established `Utils/Apicalls` convention (see `User.ts`,
// `Login.ts`, `Profile.ts`): each wrapper is a typed `fetch` call that attaches
// the JWT from localStorage as an `Authorization: Bearer <token>` header and
// returns the raw `Response` for the caller (the Review UI, task 8.2) to parse.
//
// Request shapes reuse the shared types from `@/Utils/types/JDGenerator`.

import type {
  ParsedSignal,
  Mix,
  TargetDifficulty,
  GeneratedQuestion,
} from "@/Utils/types/JDGenerator";
import { BASE_BACKEND_URL } from "@/Utils/constants";

// ---------------------------------------------------------------------------
// Route constants
// ---------------------------------------------------------------------------

const JD_PARSE_API = `${BASE_BACKEND_URL}/api/v1/jd-generator/parse`;
const JD_GENERATE_API = `${BASE_BACKEND_URL}/api/v1/jd-generator/generate`;
const JD_SET_API = `${BASE_BACKEND_URL}/api/v1/jd-generator/set`; // append `/${id}`
const JD_REGENERATE_API = `${BASE_BACKEND_URL}/api/v1/jd-generator/regenerate`;
const JD_APPROVE_API = `${BASE_BACKEND_URL}/api/v1/jd-generator/approve`;

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/** Read the JWT stored in localStorage (SSR-safe). */
const getToken = (): string => {
  return typeof window !== "undefined"
    ? (localStorage.getItem("token") ?? "")
    : "";
};

/** Headers for a JSON request body, including the bearer token. */
const jsonAuthHeaders = (): Headers => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${getToken()}`);
  return headers;
};

/** Headers for a non-JSON request (e.g. FormData) — no Content-Type so the
 *  browser can set the multipart boundary itself. */
const authHeaders = (): Headers => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${getToken()}`);
  return headers;
};

// ---------------------------------------------------------------------------
// Request body interfaces
// ---------------------------------------------------------------------------

/** Input to `parseJD`: either pasted text or an uploaded file (or both). */
export interface ParseJDInput {
  text?: string;
  file?: File;
}

/** Body for `POST /generate`. */
export interface GenerateQuestionsBody {
  jobDescriptionId: string;
  confirmedSignal: ParsedSignal;
  mix: Mix;
  difficulty: TargetDifficulty;
  preferredLanguages?: string[];
}

/** Body for `POST /regenerate`. */
export interface RegenerateQuestionBody {
  generatedQuestionSetId: string;
  index: number;
}

/** Body for `POST /approve`. */
export interface ApproveAsTestBody {
  generatedQuestionSetId: string;
  title: string;
  duration: number;
  passingScore: number;
}

// ---------------------------------------------------------------------------
// API wrappers
// ---------------------------------------------------------------------------

/**
 * `POST /api/v1/jd-generator/parse`
 *
 * Supports both the paste path (JSON `{ text }`) and the upload path
 * (`multipart/form-data` with a `file` field plus optional `text`). When a
 * `file` is supplied a FormData body is sent; otherwise a JSON body is sent.
 */
export const parseJD = async (input: ParseJDInput): Promise<Response> => {
  if (input.file) {
    const formData = new FormData();
    formData.append("file", input.file);
    if (typeof input.text === "string") {
      formData.append("text", input.text);
    }

    const requestOptions: RequestInit = {
      method: "POST",
      headers: authHeaders(),
      body: formData,
      redirect: "follow",
    };

    return await fetch(JD_PARSE_API, requestOptions);
  }

  const requestOptions: RequestInit = {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ text: input.text ?? "" }),
    redirect: "follow",
  };

  return await fetch(JD_PARSE_API, requestOptions);
};

/**
 * `POST /api/v1/jd-generator/generate`
 *
 * Runs Stage 2 generation from a confirmed signal and persists the staging set.
 */
export const generateQuestions = async (
  body: GenerateQuestionsBody,
): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(body),
    redirect: "follow",
  };

  return await fetch(JD_GENERATE_API, requestOptions);
};

/**
 * `PATCH /api/v1/jd-generator/set/[id]` with `{ op: "edit", index, question }`.
 */
export const editQuestion = async (
  setId: string,
  index: number,
  question: GeneratedQuestion,
): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "PATCH",
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ op: "edit", index, question }),
    redirect: "follow",
  };

  return await fetch(`${JD_SET_API}/${setId}`, requestOptions);
};

/**
 * `PATCH /api/v1/jd-generator/set/[id]` with `{ op: "delete", index }`.
 */
export const deleteQuestion = async (
  setId: string,
  index: number,
): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "PATCH",
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ op: "delete", index }),
    redirect: "follow",
  };

  return await fetch(`${JD_SET_API}/${setId}`, requestOptions);
};

/**
 * `PATCH /api/v1/jd-generator/set/[id]` with `{ op: "add", question }`.
 */
export const addQuestion = async (
  setId: string,
  question: GeneratedQuestion,
): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "PATCH",
    headers: jsonAuthHeaders(),
    body: JSON.stringify({ op: "add", question }),
    redirect: "follow",
  };

  return await fetch(`${JD_SET_API}/${setId}`, requestOptions);
};

/**
 * `POST /api/v1/jd-generator/regenerate`
 *
 * Regenerates a single question by index (cooldown-gated server-side).
 */
export const regenerateQuestion = async (
  body: RegenerateQuestionBody,
): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(body),
    redirect: "follow",
  };

  return await fetch(JD_REGENERATE_API, requestOptions);
};

/**
 * `POST /api/v1/jd-generator/approve`
 *
 * Maps an approved set into an `Assignment` + `Question` documents.
 */
export const approveAsTest = async (
  body: ApproveAsTestBody,
): Promise<Response> => {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(body),
    redirect: "follow",
  };

  return await fetch(JD_APPROVE_API, requestOptions);
};
