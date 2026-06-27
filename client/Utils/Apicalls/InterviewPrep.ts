// Client-side API wrappers for the Interview Prep feature. Mirrors the existing
// Utils/Apicalls convention: each wrapper attaches the JWT from localStorage as
// an `Authorization: Bearer <token>` header and returns the raw `Response`
// (or `false` on a thrown network error) for the caller to parse.

import { BASE_BACKEND_URL } from "@/Utils/constants";
import type {
  PageInput,
  PageStatus,
  ReorderItem,
  SubjectInput,
  ChapterInput,
  UpdatePageProgressRequest,
} from "@/Utils/types/InterviewPrep";

const BASE = `${BASE_BACKEND_URL}/api/v1/interview-prep`;

const getToken = (): string =>
  typeof window !== "undefined" ? (localStorage.getItem("token") ?? "") : "";

const jsonHeaders = (): Headers => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${getToken()}`);
  return headers;
};

const authHeaders = (): Headers => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${getToken()}`);
  return headers;
};

// ---------------------------------------------------------------------------
// Reads (any logged-in user)
// ---------------------------------------------------------------------------

export const getNavTree = async (): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/nav-tree`, { headers: authHeaders() });
  } catch (error) {
    console.error("getNavTree error:", error);
    return false;
  }
};

export const searchPages = async (
  query: string,
): Promise<Response | false> => {
  try {
    return await fetch(
      `${BASE}/pages/search?q=${encodeURIComponent(query)}`,
      { headers: authHeaders() },
    );
  } catch (error) {
    console.error("searchPages error:", error);
    return false;
  }
};

export const getPageBySlug = async (
  slug: string,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages/${encodeURIComponent(slug)}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    console.error("getPageBySlug error:", error);
    return false;
  }
};

export const toggleLike = async (pageId: string): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages/${pageId}/like`, {
      method: "POST",
      headers: jsonHeaders(),
    });
  } catch (error) {
    console.error("toggleLike error:", error);
    return false;
  }
};

export const updatePageProgress = async (
  pageId: string,
  data: UpdatePageProgressRequest,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages/${pageId}/progress`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("updatePageProgress error:", error);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Admin-only — call only from admin-gated UI; the server enforces this
// independently regardless.
// ---------------------------------------------------------------------------

export const createSubject = async (
  data: SubjectInput,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/subjects`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("createSubject error:", error);
    return false;
  }
};

export const updateSubject = async (
  id: string,
  data: Partial<SubjectInput>,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/subjects`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify({ _id: id, ...data }),
    });
  } catch (error) {
    console.error("updateSubject error:", error);
    return false;
  }
};

export const deleteSubject = async (
  id: string,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/subjects`, {
      method: "DELETE",
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error("deleteSubject error:", error);
    return false;
  }
};

export const createChapter = async (
  data: ChapterInput,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/chapters`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("createChapter error:", error);
    return false;
  }
};

export const updateChapter = async (
  id: string,
  data: Partial<Pick<ChapterInput, "title" | "order">>,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/chapters`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify({ _id: id, ...data }),
    });
  } catch (error) {
    console.error("updateChapter error:", error);
    return false;
  }
};

export const deleteChapter = async (
  id: string,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/chapters`, {
      method: "DELETE",
      headers: jsonHeaders(),
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error("deleteChapter error:", error);
    return false;
  }
};

export const reorderChapters = async (
  items: ReorderItem[],
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/chapters/reorder`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ items }),
    });
  } catch (error) {
    console.error("reorderChapters error:", error);
    return false;
  }
};

export const createPage = async (
  data: PageInput,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("createPage error:", error);
    return false;
  }
};

export const updatePage = async (
  id: string,
  data: Partial<PageInput>,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages/${id}`, {
      method: "PUT",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("updatePage error:", error);
    return false;
  }
};

export const setPageStatus = async (
  id: string,
  status: PageStatus,
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages/${id}/status`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error("setPageStatus error:", error);
    return false;
  }
};

export const reorderPages = async (
  items: ReorderItem[],
): Promise<Response | false> => {
  try {
    return await fetch(`${BASE}/pages/reorder`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ items }),
    });
  } catch (error) {
    console.error("reorderPages error:", error);
    return false;
  }
};
