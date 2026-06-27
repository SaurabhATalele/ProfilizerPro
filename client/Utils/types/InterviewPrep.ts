// Shared TypeScript types for the Interview Prep feature.
// See feature-interview-prep.md (Section 2). These are imported on both the
// client (Apicalls + Components) and server (Controllers) so request/response
// shapes are defined once.

export type PageStatus = "draft" | "published" | "archived";
export type ProgressStatus = "not-started" | "in-progress" | "completed";

// ---------------------------------------------------------------------------
// Nav tree (powers the sidebar; no page `content` bodies are included here).
// ---------------------------------------------------------------------------

export interface NavTreePageItem {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  /** Present in the admin nav tree (admins see all statuses); omit for readers. */
  status?: PageStatus;
}

export interface NavTreeChapter {
  _id: string;
  title: string;
  pages: NavTreePageItem[];
}

export interface NavTreeSubject {
  _id: string;
  key: string;
  label: string;
  icon?: string;
  chapters: NavTreeChapter[];
}

export interface NavTreeResponse {
  subjects: NavTreeSubject[];
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Page detail (the reader view).
// ---------------------------------------------------------------------------

export interface PageBreadcrumb {
  subjectLabel: string;
  chapterTitle: string;
}

export interface PageDetailResponse {
  _id: string;
  title: string;
  slug: string;
  content: string;
  icon?: string;
  viewCount: number;
  likeCount: number;
  liked: boolean; // whether the requesting user has liked it
  progressStatus: ProgressStatus;
  breadcrumb: PageBreadcrumb;
  // Admin-only authoring fields, populated only when the requester is an admin
  // so the editor has everything it needs from a single read.
  chapterId?: string;
  status?: PageStatus;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Search results (titles only — no content bodies).
// ---------------------------------------------------------------------------

export interface SearchPageResult {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
}

// ---------------------------------------------------------------------------
// Progress / like requests + responses.
// ---------------------------------------------------------------------------

export interface UpdatePageProgressRequest {
  liked?: boolean;
  status?: ProgressStatus;
  notes?: string;
}

export interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
}

// ---------------------------------------------------------------------------
// Admin authoring shapes.
// ---------------------------------------------------------------------------

export interface SubjectInput {
  key?: string;
  label: string;
  icon?: string;
  order?: number;
}

export interface ChapterInput {
  subjectId: string;
  title: string;
  order?: number;
}

export interface PageInput {
  title: string;
  slug?: string;
  chapterId: string;
  order?: number;
  icon?: string;
  content: string;
  status?: PageStatus;
  tags?: string[];
}

export interface ReorderItem {
  _id: string;
  order: number;
}
